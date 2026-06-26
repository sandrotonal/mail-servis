const leadScoringService = require('../services/leadScoringService');

class LeadScoringService {
  async calculateScore(lead) {
    let score = 0;
    
    score += this.scoreEmail(lead.email);
    score += this.scoreCompleteness(lead);
    score += this.scoreEngagement(lead);
    score += this.scoreCompany(lead);
    score += this.scoreRecency(lead);
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }
  
  scoreEmail(email) {
    if (!email) return 0;
    
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    
    if (freeProviders.includes(domain)) {
      return 5;
    }
    
    return 20;
  }
  
  scoreCompleteness(lead) {
    let score = 0;
    
    if (lead.name) score += 5;
    if (lead.email) score += 5;
    if (lead.phone) score += 3;
    if (lead.company) score += 4;
    if (lead.jobTitle) score += 3;
    
    return score;
  }
  
  scoreEngagement(lead) {
    let score = 0;
    
    if (lead.activities?.length > 1) score += 5;
    if (lead.activities?.length > 3) score += 5;
    
    if (lead.notes?.length > 0) score += 5;
    
    if (lead.lastContactedAt) {
      const daysSince = (Date.now() - new Date(lead.lastContactedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) score += 5;
    }
    
    return score;
  }
  
  scoreCompany(lead) {
    if (!lead.company) return 0;
    
    let score = 10;
    
    if (lead.jobTitle) {
      const seniorTitles = ['director', 'manager', 'head', 'vp', 'ceo', 'cto', 'cfo', 'founder', 'owner'];
      const titleLower = lead.jobTitle.toLowerCase();
      
      if (seniorTitles.some(t => titleLower.includes(t))) {
        score += 10;
      }
    }
    
    return score;
  }
  
  scoreRecency(lead) {
    const daysSince = (Date.now() - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24);
    
    if (daysSince < 1) return 20;
    if (daysSince < 3) return 15;
    if (daysSince < 7) return 10;
    if (daysSince < 14) return 5;
    
    return 0;
  }
}

module.exports = new LeadScoringService();
