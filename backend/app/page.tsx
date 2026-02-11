'use client';

import { useEffect, useState } from 'react';
import { Prisma } from '@prisma/client';

interface Counts {
  users: number;
  profiles: number;
  designs: number;
  generations: number;
}

export default function Home() {
  const [counts, setCounts] = useState<Counts>({
    users: 0,
    profiles: 0,
    designs: 0,
    generations: 0
  });

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setCounts({
            users: data.userCount || 0,
            profiles: data.profileCount || 0,
            designs: data.designCount || 0,
            generations: data.generationCount || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch counts:', error);
      }
    }

    fetchCounts();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🎨 AI Clothing Brand Backend API</h1>
      <p>Backend API for AI-powered clothing brand mockup generation service.</p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '1rem', 
        margin: '2rem 0' 
      }}>
        <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
          <h3 style={{ margin: '0' }}>👥 Users</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{counts.users}</p>
        </div>
        <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
          <h3 style={{ margin: '0' }}>🏢 Profiles</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{counts.profiles}</p>
        </div>
        <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
          <h3 style={{ margin: '0' }}>🎨 Designs</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{counts.designs}</p>
        </div>
        <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px' }}>
          <h3 style={{ margin: '0' }}>🤖 Generations</h3>
          <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{counts.generations}</p>
        </div>
      </div>
      
      <h2>📚 Available Endpoints</h2>
      <ul>
        <li><code>POST /api/auth/signup</code> - User registration</li>
        <li><code>POST /api/auth/login</code> - User login</li>
        <li><code>GET /api/profiles</code> - Get brand profiles</li>
        <li><code>POST /api/profiles</code> - Create brand profile</li>
        <li><code>GET /api/designs</code> - Get designs</li>
        <li><code>POST /api/designs</code> - Upload design</li>
        <li><code>GET /api/generations</code> - Get AI generations</li>
        <li><code>POST /api/generate</code> - Generate AI mockup/video</li>
        <li><code>GET /api/enums</code> - Get all enum values</li>
        <li><code>GET /api/health</code> - Health check & stats</li>
      </ul>
    </div>
  );
}

