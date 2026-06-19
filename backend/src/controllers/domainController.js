const { Domain } = require('../models');
const crypto = require('crypto');
const { NotFoundError, AppError } = require('../utils/errors');
const asyncHandler = require('../middlewares/asyncHandler');
const dns = require('dns').promises;
const logger = require('../utils/logger');

const addDomain = asyncHandler(async (req, res) => {
  const { domain } = req.body;
  if (!domain) throw new AppError('Domain is required', 400);

  const existing = await Domain.findOne({ domain: domain.toLowerCase() });
  if (existing) throw new AppError('Domain already registered', 409);

  const verificationToken = crypto.randomBytes(16).toString('hex');

  const doc = await Domain.create({
    workspace: req.params.workspaceId,
    domain: domain.toLowerCase(),
    verificationToken,
    dnsRecords: {
      spf: { value: `v=spf1 include:mailservis.io ~all`, verified: false },
      dkim: { value: `v=DKIM1; k=rsa; p=<your-public-key>`, verified: false },
      dmarc: { value: `v=DMARC1; p=none; rua=mailto:dmarc@mailservis.io`, verified: false },
    },
  });

  res.status(201).json({
    success: true,
    data: {
      domain: doc,
      verificationToken,
      instructions: {
        txt: { name: `_mailservis-verify.${domain}`, value: verificationToken },
        spf: { type: 'TXT', name: `@`, value: doc.dnsRecords.spf.value },
        dkim: { type: 'TXT', name: `mail._domainkey.${domain}`, value: doc.dnsRecords.dkim.value },
        dmarc: { type: 'TXT', name: `_dmarc.${domain}`, value: doc.dnsRecords.dmarc.value },
      },
    },
  });
});

const listDomains = asyncHandler(async (req, res) => {
  const domains = await Domain.find({ workspace: req.params.workspaceId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: { domains } });
});

const verifyDomain = asyncHandler(async (req, res) => {
  const doc = await Domain.findOne({
    _id: req.params.domainId,
    workspace: req.params.workspaceId,
  });
  if (!doc) throw new NotFoundError('Domain not found.');

  let spfVerified = false;
  let dmarcVerified = false;

  try {
    const txtRecords = await dns.resolveTxt(doc.domain);
    const flattened = txtRecords.map((r) => r.join(''));
    spfVerified = flattened.some((r) => r.startsWith('v=spf1'));
    dmarcVerified = flattened.some((r) => r.startsWith('v=DMARC1'));
  } catch (err) {
    logger.warn('DNS lookup failed for domain verification:', err.message);
  }

  const isVerified = spfVerified || dmarcVerified;
  doc.dnsRecords.spf.verified = spfVerified;
  doc.dnsRecords.dmarc.verified = dmarcVerified;
  doc.verificationStatus = isVerified ? 'verified' : 'failed';
  if (isVerified) doc.verifiedAt = new Date();
  await doc.save();

  res.status(200).json({ success: true, data: { domain: doc } });
});

const removeDomain = asyncHandler(async (req, res) => {
  const doc = await Domain.findOneAndDelete({
    _id: req.params.domainId,
    workspace: req.params.workspaceId,
  });
  if (!doc) throw new NotFoundError('Domain not found.');
  res.status(200).json({ success: true, message: 'Domain removed.' });
});

module.exports = { addDomain, listDomains, verifyDomain, removeDomain };
