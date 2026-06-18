const config = require('../config');
const logger = require('../utils/logger');

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'trashmail.com', 'sharklasers.com', 'burnermail.io',
  '10minutemail.com', 'mailnator.com', 'temp-mail.org',
];

const SPAM_KEYWORDS = [
  'buy now', 'free money', 'click here', 'act now', 'limited offer',
  'congratulations', 'you won', 'prize', 'casino', 'viagra',
  'earn money', 'work from home', 'no investment', 'get rich',
];

class SpamService {
  calculateSpamScore(formData, metadata) {
    let score = 0;
    const reasons = [];

    const honeypotScore = this.checkHoneypot(formData);
    score += honeypotScore;
    if (honeypotScore > 0) reasons.push('honeypot_triggered');

    const disposableScore = this.checkDisposableEmail(formData.email);
    score += disposableScore;
    if (disposableScore > 0) reasons.push('disposable_email');

    const keywordScore = this.checkKeywords(formData);
    score += keywordScore;
    if (keywordScore > 0) reasons.push('spam_keywords');

    const repetitionScore = this.checkRepetition(formData);
    score += repetitionScore;
    if (repetitionScore > 0) reasons.push('repetitive_content');

    const urlScore = this.checkUrls(formData);
    score += urlScore;
    if (urlScore > 0) reasons.push('excessive_urls');

    const ipScore = metadata?.ip ? this.checkIpReputation(metadata.ip) : 0;
    score += ipScore;

    const finalScore = Math.min(100, score);
    const isSpam = finalScore >= 50;

    logger.debug('Spam check', { score: finalScore, isSpam, reasons, email: formData.email });

    return { score: finalScore, isSpam, reasons };
  }

  checkHoneypot(formData) {
    if (formData._honeypot && formData._honeypot.length > 0) {
      return 100;
    }
    return 0;
  }

  checkDisposableEmail(email) {
    if (!email) return 0;
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return 0;
    if (DISPOSABLE_DOMAINS.includes(domain)) return 40;
    return 0;
  }

  checkKeywords(formData) {
    let score = 0;
    const textFields = [formData.message, formData.subject, formData.name].filter(Boolean);

    for (const text of textFields) {
      if (!text || typeof text !== 'string') continue;
      const lower = text.toLowerCase();
      for (const keyword of SPAM_KEYWORDS) {
        if (lower.includes(keyword)) {
          score += 15;
        }
      }
    }

    return Math.min(50, score);
  }

  checkRepetition(formData) {
    const textFields = [formData.message, formData.subject].filter(Boolean);
    for (const text of textFields) {
      if (!text || typeof text !== 'string') continue;
      const words = text.split(/\s+/);
      const wordCount = words.length;
      const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;

      if (wordCount > 20 && uniqueWords / wordCount < 0.4) {
        return 30;
      }
    }
    return 0;
  }

  checkUrls(formData) {
    let score = 0;
    const textFields = [formData.message, formData.subject, formData.name].filter(Boolean);

    for (const text of textFields) {
      if (!text || typeof text !== 'string') continue;
      const urlCount = (text.match(/https?:\/\//g) || []).length;
      if (urlCount > 3) score += 15;
      if (urlCount > 10) score += 30;
    }

    return Math.min(40, score);
  }

  checkIpReputation(ip) {
    return 0;
  }
}

module.exports = new SpamService();
