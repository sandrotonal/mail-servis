# Analytics Dashboard Implementation Guide

## 1. Backend Analytics Service

### 1.1 Analytics Model
```javascript
// backend/src/models/analytics.js - Enhanced

const analyticsSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  date: { type: Date, required: true },
  
  // Metrics
  metrics: {
    totalSubmissions: { type: Number, default: 0 },
    totalLeads: { type: Number, default: 0 },
    emailsSent: { type: Number, default: 0 },
    emailsFailed: { type: Number, default: 0 },
    uniqueVisitors: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  
  // Geographic data
  countries: [{
    code: String,
    name: String,
    count: Number
  }],
  
  // Device data
  devices: {
    desktop: { type: Number, default: 0 },
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 }
  },
  
  // Browser data
  browsers: [{
    name: String,
    count: Number
  }],
  
  // Hourly breakdown
  hourly: [{
    hour: Number,
    submissions: Number
  }]
}, { timestamps: true });

// Compound index for efficient queries
analyticsSchema.index({ workspace: 1, date: -1 });
analyticsSchema.index({ project: 1, date: -1 });
```

### 1.2 Analytics Service
```javascript
// backend/src/services/analyticsService.js

const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

class AnalyticsService {
  async trackSubmission(submission, request) {
    const { workspace, project } = submission;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create analytics record
    let analytics = await Analytics.findOne({
      workspace,
      project,
      date: today
    });

    if (!analytics) {
      analytics = await Analytics.create({
        workspace,
        project,
        date: today,
        metrics: {},
        countries: [],
        browsers: [],
        hourly: Array(24).fill(0).map((_, i) => ({ hour: i, submissions: 0 }))
      });
    }

    // Update metrics
    analytics.metrics.totalSubmissions += 1;

    // Track geography
    const ip = this.getClientIP(request);
    const geo = geoip.lookup(ip);
    if (geo) {
      const countryIndex = analytics.countries.findIndex(c => c.code === geo.country);
      if (countryIndex >= 0) {
        analytics.countries[countryIndex].count += 1;
      } else {
        analytics.countries.push({
          code: geo.country,
          name: this.getCountryName(geo.country),
          count: 1
        });
      }
    }

    // Track device
    const ua = UAParser(request.headers['user-agent']);
    const deviceType = ua.device.type || 'desktop';
    if (analytics.devices[deviceType] !== undefined) {
      analytics.devices[deviceType] += 1;
    }

    // Track browser
    const browserName = ua.browser.name;
    if (browserName) {
      const browserIndex = analytics.browsers.findIndex(b => b.name === browserName);
      if (browserIndex >= 0) {
        analytics.browsers[browserIndex].count += 1;
      } else {
        analytics.browsers.push({ name: browserName, count: 1 });
      }
    }

    // Track hourly
    const hour = new Date().getHours();
    const hourlyIndex = analytics.hourly.findIndex(h => h.hour === hour);
    if (hourlyIndex >= 0) {
      analytics.hourly[hourlyIndex].submissions += 1;
    }

    await analytics.save();
  }

  async getWorkspaceAnalytics(workspaceId, startDate, endDate) {
    const analytics = await Analytics.aggregate([
      {
        $match: {
          workspace: workspaceId,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: '$metrics.totalSubmissions' },
          totalLeads: { $sum: '$metrics.totalLeads' },
          emailsSent: { $sum: '$metrics.emailsSent' },
          emailsFailed: { $sum: '$metrics.emailsFailed' }
        }
      }
    ]);

    return analytics[0] || {
      totalSubmissions: 0,
      totalLeads: 0,
      emailsSent: 0,
      emailsFailed: 0
    };
  }

  async getDailyTrend(workspaceId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trend = await Analytics.aggregate([
      {
        $match: {
          workspace: workspaceId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$date',
          submissions: { $sum: '$metrics.totalSubmissions' },
          leads: { $sum: '$metrics.totalLeads' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return trend.map(t => ({
      date: t._id,
      submissions: t.submissions,
      leads: t.leads
    }));
  }

  async getTopCountries(workspaceId, limit = 10) {
    const analytics = await Analytics.find({ workspace: workspaceId })
      .sort({ date: -1 })
      .limit(30);

    const countryMap = new Map();
    
    analytics.forEach(a => {
      a.countries.forEach(c => {
        const current = countryMap.get(c.code) || 0;
        countryMap.set(c.code, current + c.count);
      });
    });

    return Array.from(countryMap.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getClientIP(request) {
    return request.headers['x-forwarded-for']?.split(',')[0] ||
           request.headers['x-real-ip'] ||
           request.connection.remoteAddress;
  }

  getCountryName(code) {
    const countries = {
      US: 'United States',
      GB: 'United Kingdom',
      DE: 'Germany',
      FR: 'France',
      TR: 'Turkey',
      // Add more as needed
    };
    return countries[code] || code;
  }
}

module.exports = new AnalyticsService();
```

### 1.3 Analytics Controller
```javascript
// backend/src/controllers/analyticsController.js

const analyticsService = require('../services/analyticsService');

exports.getWorkspaceStats = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { startDate, endDate } = req.query;

  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  const stats = await analyticsService.getWorkspaceAnalytics(workspaceId, start, end);

  res.json({
    success: true,
    data: stats
  });
});

exports.getDailyTrend = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { days = 30 } = req.query;

  const trend = await analyticsService.getDailyTrend(workspaceId, parseInt(days));

  res.json({
    success: true,
    data: trend
  });
});

exports.getTopCountries = asyncHandler(async (req, res) => {
  const { workspaceId } = req.params;
  const { limit = 10 } = req.query;

  const countries = await analyticsService.getTopCountries(workspaceId, parseInt(limit));

  res.json({
    success: true,
    data: countries
  });
});
```

## 2. Frontend Analytics Dashboard

### 2.1 Analytics Page Component
```typescript
// frontend/src/app/dashboard/analytics/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Mail, Users, AlertCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [statsRes, trendRes] = await Promise.all([
        fetch('/api/v1/analytics/workspace/current/stats'),
        fetch('/api/v1/analytics/workspace/current/trend?days=30')
      ]);

      const statsData = await statsRes.json();
      const trendData = await trendRes.json();

      setStats(statsData.data);
      setDailyTrend(trendData.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Submissions"
          value={stats?.totalSubmissions || 0}
          icon={<TrendingUp className="h-4 w-4" />}
          trend="+12.5%"
        />
        <StatCard
          title="Total Leads"
          value={stats?.totalLeads || 0}
          icon={<Users className="h-4 w-4" />}
          trend="+8.2%"
        />
        <StatCard
          title="Emails Sent"
          value={stats?.emailsSent || 0}
          icon={<Mail className="h-4 w-4" />}
          trend="+15.3%"
        />
        <StatCard
          title="Failed Emails"
          value={stats?.emailsFailed || 0}
          icon={<AlertCircle className="h-4 w-4" />}
          trend="-2.1%"
          trendPositive={false}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Submissions Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Submissions (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="submissions" stroke="#4F46E5" />
                <Line type="monotone" dataKey="leads" stroke="#10B981" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendPositive = true }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className={`text-xs ${trendPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend} from last period
        </p>
      </CardContent>
    </Card>
  );
}
```

