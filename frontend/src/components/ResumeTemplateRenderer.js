import React from 'react';
import ReactMarkdown from 'react-markdown';

const ResumeTemplateRenderer = ({ content, template, personalInfo, customization }) => {
  if (!content) return null;

  const templateId = template?.id || 'minimalist-clean';
  
  // Extract personal info from content or props
  const extractContactInfo = () => {
    if (personalInfo) return personalInfo;
    
    const lines = content.split('\n');
    const info = { name: '', email: '', phone: '', location: '', linkedin: '', portfolio: '' };
    
    for (const line of lines) {
      if (line.match(/^#+\s+/)) {
        info.name = line.replace(/^#+\s+/, '').trim();
      }
      if (line.includes('**Email:**') || line.includes('email:') || line.includes('Email:')) {
        const match = line.match(/[\w\.-]+@[\w\.-]+\.\w+/);
        if (match) info.email = match[0];
      }
      if (line.includes('**Phone:**') || line.includes('phone:') || line.includes('Phone:')) {
        const match = line.match(/[\d\+\-\(\)\s]+/);
        if (match) info.phone = match[0].trim();
      }
      if (line.includes('**Location:**') || line.includes('location:') || line.includes('Location:')) {
        const match = line.match(/:\s*(.+)/);
        if (match) info.location = match[1].trim();
      }
      if (line.includes('**LinkedIn:**') || line.includes('linkedin:') || line.includes('LinkedIn:')) {
        const match = line.match(/https?:\/\/[^\s]+/);
        if (match) info.linkedin = match[0];
      }
      if (line.includes('**Portfolio:**') || line.includes('portfolio:') || line.includes('Portfolio:')) {
        const match = line.match(/https?:\/\/[^\s]+/);
        if (match) info.portfolio = match[0];
      }
    }
    return info;
  };

  const contactInfo = extractContactInfo();
  
  // Parse content into structured sections
  const parseContent = () => {
    const sections = [];
    const lines = content.split('\n');
    let currentSection = { title: '', content: [], type: 'section' };
    let skipHeader = true;
    
    for (const line of lines) {
      // Skip the main header (name)
      if (skipHeader && (line.startsWith('# ') || line.startsWith('## '))) {
        skipHeader = false;
        if (line.startsWith('## ')) {
          currentSection.title = line.replace('## ', '').trim();
        }
        continue;
      }
      
      if (line.startsWith('## ')) {
        if (currentSection.title) {
          sections.push(currentSection);
        }
        currentSection = {
          title: line.replace('## ', '').trim(),
          content: [],
          type: 'section'
        };
      } else if (line.startsWith('### ')) {
        currentSection.content.push({ type: 'subheading', text: line.replace('### ', '').trim() });
      } else if (line.trim() && !line.match(/^\*\*.*\*\*:\s*$/)) {
        // Skip contact info lines
        if (!line.includes('**Email:**') && !line.includes('**Phone:**') && 
            !line.includes('**Location:**') && !line.includes('**LinkedIn:**') && 
            !line.includes('**Portfolio:**') && !line.match(/^[\w\.-]+@[\w\.-]+\.\w+$/)) {
          currentSection.content.push({ type: 'text', text: line });
        }
      }
    }
    if (currentSection.title) {
      sections.push(currentSection);
    }
    return sections;
  };

  const sections = parseContent();

  // Professional Classic - Inspired by traditional corporate resumes
  const renderProfessionalClassic = () => (
    <div className="bg-white" style={{ 
      maxWidth: '8.5in', 
      margin: '0 auto', 
      padding: '0.75in',
      fontFamily: '"Calibri", "Arial", sans-serif',
      fontSize: '11pt',
      lineHeight: '1.5',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      color: '#2c3e50'
    }}>
      {/* Professional Header with Blue Accent */}
      <div style={{ 
        borderBottom: '3px solid #2563eb', 
        paddingBottom: '15px', 
        marginBottom: '25px' 
      }}>
        <h1 style={{ 
          fontSize: '28pt', 
          fontWeight: '700', 
          color: '#1e40af', 
          marginBottom: '8px',
          letterSpacing: '0.5px',
          fontFamily: '"Georgia", serif'
        }}>
          {contactInfo.name || 'Your Name'}
        </h1>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '12px', 
          fontSize: '10pt', 
          color: '#64748b',
          fontWeight: '400'
        }}>
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.phone && <span style={{ color: '#94a3b8' }}>|</span>}
          {contactInfo.phone && <span>{contactInfo.phone}</span>}
          {contactInfo.location && <span style={{ color: '#94a3b8' }}>|</span>}
          {contactInfo.location && <span>{contactInfo.location}</span>}
          {contactInfo.linkedin && <span style={{ color: '#94a3b8' }}>|</span>}
          {contactInfo.linkedin && <span>LinkedIn: {contactInfo.linkedin.replace(/https?:\/\//, '')}</span>}
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div>
          {sections.map((section, idx) => (
            <div key={idx} style={{ marginBottom: '22px' }}>
              <h2 style={{ 
                fontSize: '14pt', 
                fontWeight: '700', 
                color: '#2563eb', 
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '10px',
                paddingBottom: '5px',
                borderBottom: '2px solid #93c5fd'
              }}>
                {section.title}
              </h2>
              <div style={{ paddingLeft: '0' }}>
                <ReactMarkdown
                  components={{
                    p: ({children}) => <p style={{ marginBottom: '8px', color: '#374151', lineHeight: '1.6' }}>{children}</p>,
                    ul: ({children}) => <ul style={{ marginLeft: '20px', marginBottom: '12px', padding: 0 }}>{children}</ul>,
                    li: ({children}) => <li style={{ marginBottom: '6px', color: '#4b5563', fontSize: '10.5pt' }}>{children}</li>,
                    strong: ({children}) => <strong style={{ fontWeight: '700', color: '#1f2937' }}>{children}</strong>
                  }}
                >
                  {section.content.map(c => c.text).join('\n')}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
        
        {/* Sidebar */}
        <div style={{ 
          borderLeft: '2px solid #e5e7eb', 
          paddingLeft: '20px'
        }}>
          {/* Skills section if exists */}
          {sections.find(s => s.title.toLowerCase().includes('skill')) && (
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                fontSize: '12pt', 
                fontWeight: '700', 
                color: '#2563eb',
                marginBottom: '10px',
                textTransform: 'uppercase'
              }}>
                Skills
              </h3>
              <div style={{ fontSize: '10pt', color: '#4b5563', lineHeight: '1.8' }}>
                {/* Skills will be rendered from content */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Modern Executive - Clean and sophisticated
  const renderModernExecutive = () => (
    <div className="bg-white" style={{ 
      maxWidth: '8.5in', 
      margin: '0 auto', 
      padding: '0.6in',
      fontFamily: '"Segoe UI", "Arial", sans-serif',
      fontSize: '11pt',
      lineHeight: '1.6',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      color: '#1f2937'
    }}>
      {/* Elegant Header with Green Accent */}
      <div style={{ 
        borderLeft: '5px solid #059669', 
        paddingLeft: '25px', 
        marginBottom: '30px',
        paddingTop: '10px'
      }}>
        <h1 style={{ 
          fontSize: '32pt', 
          fontWeight: '700', 
          color: '#047857', 
          marginBottom: '8px',
          letterSpacing: '-0.5px',
          lineHeight: '1.1'
        }}>
          {contactInfo.name || 'Your Name'}
        </h1>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '15px', 
          fontSize: '10pt', 
          color: '#6b7280',
          fontWeight: '500',
          marginTop: '5px'
        }}>
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.phone && <span style={{ color: '#9ca3af' }}>|</span>}
          {contactInfo.phone && <span>{contactInfo.phone}</span>}
          {contactInfo.location && <span style={{ color: '#9ca3af' }}>|</span>}
          {contactInfo.location && <span>{contactInfo.location}</span>}
        </div>
      </div>

      {sections.map((section, idx) => (
        <div key={idx} style={{ marginBottom: '25px' }}>
          <h2 style={{ 
            fontSize: '16pt', 
            fontWeight: '700', 
            color: '#059669', 
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ 
              width: '50px', 
              height: '3px', 
              backgroundColor: '#10b981',
              display: 'inline-block'
            }}></span>
            {section.title}
          </h2>
          <ReactMarkdown
            components={{
              p: ({children}) => <p style={{ marginBottom: '10px', color: '#374151', lineHeight: '1.7' }}>{children}</p>,
              ul: ({children}) => <ul style={{ listStyle: 'none', marginLeft: '0', marginBottom: '15px', padding: 0 }}>{children}</ul>,
              li: ({children}) => (
                <li style={{ 
                  marginBottom: '8px', 
                  color: '#4b5563',
                  paddingLeft: '20px',
                  position: 'relative'
                }}>
                  <span style={{ 
                    position: 'absolute', 
                    left: '0', 
                    color: '#059669',
                    fontWeight: 'bold'
                  }}>▸</span>
                  <span>{children}</span>
                </li>
              ),
              strong: ({children}) => <strong style={{ fontWeight: '700', color: '#1f2937' }}>{children}</strong>
            }}
          >
            {section.content.map(c => c.text).join('\n')}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );

  // Creative Professional - Bold and vibrant
  const renderCreativeProfessional = () => (
    <div className="bg-white" style={{ 
      maxWidth: '8.5in', 
      margin: '0 auto',
      fontFamily: '"Helvetica Neue", "Arial", sans-serif',
      fontSize: '11pt',
      lineHeight: '1.6',
      boxShadow: '0 0 25px rgba(220,38,38,0.15)',
      overflow: 'hidden'
    }}>
      {/* Bold Red Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', 
        color: 'white',
        padding: '35px 0.6in',
        marginBottom: '25px'
      }}>
        <h1 style={{ 
          fontSize: '36pt', 
          fontWeight: '800', 
          marginBottom: '12px',
          letterSpacing: '-1px',
          textShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {contactInfo.name || 'Your Name'}
        </h1>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '18px', 
          fontSize: '11pt',
          opacity: '0.95',
          fontWeight: '400'
        }}>
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.phone && <span>•</span>}
          {contactInfo.phone && <span>{contactInfo.phone}</span>}
          {contactInfo.location && <span>•</span>}
          {contactInfo.location && <span>{contactInfo.location}</span>}
        </div>
      </div>

      <div style={{ padding: '0 0.6in 0.6in' }}>
        {sections.map((section, idx) => (
          <div key={idx} style={{ 
            marginBottom: '22px', 
            marginLeft: '20px',
            paddingLeft: '25px',
            borderLeft: '4px solid #dc2626'
          }}>
            <h2 style={{ 
              fontSize: '15pt', 
              fontWeight: '700', 
              color: '#dc2626', 
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              marginBottom: '12px'
            }}>
              {section.title}
            </h2>
            <ReactMarkdown
              components={{
                p: ({children}) => <p style={{ marginBottom: '10px', color: '#374151', lineHeight: '1.6' }}>{children}</p>,
                ul: ({children}) => <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>{children}</ul>,
                li: ({children}) => <li style={{ marginBottom: '7px', color: '#4b5563' }}>{children}</li>,
                strong: ({children}) => <strong style={{ fontWeight: '700', color: '#1f2937' }}>{children}</strong>
              }}
            >
              {section.content.map(c => c.text).join('\n')}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  );

  // Minimalist Clean - ATS-optimized
  const renderMinimalistClean = () => (
    <div className="bg-white" style={{ 
      maxWidth: '8.5in', 
      margin: '0 auto', 
      padding: '0.75in',
      fontFamily: '"Arial", "Calibri", sans-serif',
      fontSize: '11pt',
      lineHeight: '1.5',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      color: '#1f2937'
    }}>
      {/* Centered Clean Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px', 
        paddingBottom: '20px', 
        borderBottom: '1px solid #e5e7eb' 
      }}>
        <h1 style={{ 
          fontSize: '24pt', 
          fontWeight: '300', 
          color: '#1e293b', 
          marginBottom: '8px',
          letterSpacing: '4px',
          textTransform: 'uppercase'
        }}>
          {contactInfo.name || 'Your Name'}
        </h1>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          gap: '12px', 
          fontSize: '9.5pt', 
          color: '#64748b',
          fontWeight: '400'
        }}>
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.phone && <span>|</span>}
          {contactInfo.phone && <span>{contactInfo.phone}</span>}
          {contactInfo.location && <span>|</span>}
          {contactInfo.location && <span>{contactInfo.location}</span>}
        </div>
      </div>

      {sections.map((section, idx) => (
        <div key={idx} style={{ marginBottom: '20px' }}>
          <h2 style={{ 
            fontSize: '11pt', 
            fontWeight: '700', 
            color: '#475569', 
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '8px'
          }}>
            {section.title}
          </h2>
          <div style={{ 
            marginBottom: '12px', 
            borderTop: '1px solid #e2e8f0',
            height: '1px'
          }}></div>
          <ReactMarkdown
            components={{
              p: ({children}) => <p style={{ marginBottom: '8px', color: '#374151', lineHeight: '1.6', fontSize: '10.5pt' }}>{children}</p>,
              ul: ({children}) => <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>{children}</ul>,
              li: ({children}) => <li style={{ marginBottom: '5px', color: '#4b5563', fontSize: '10.5pt' }}>{children}</li>,
              strong: ({children}) => <strong style={{ fontWeight: '600' }}>{children}</strong>
            }}
          >
            {section.content.map(c => c.text).join('\n')}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );

  // Continue with other templates following the same professional pattern...
  const renderChronologicalStandard = () => (
    <div className="bg-white" style={{ 
      maxWidth: '8.5in', 
      margin: '0 auto', 
      padding: '0.65in',
      fontFamily: '"Times New Roman", serif',
      fontSize: '11pt',
      lineHeight: '1.6',
      boxShadow: '0 0 15px rgba(0,0,0,0.1)',
      color: '#1f2937'
    }}>
      <div style={{ 
        background: '#1f2937', 
        color: 'white',
        padding: '25px 30px',
        marginBottom: '25px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '32pt', 
          fontWeight: '700', 
          marginBottom: '10px',
          letterSpacing: '1px'
        }}>
          {contactInfo.name || 'Your Name'}
        </h1>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          gap: '15px', 
          fontSize: '10.5pt',
          opacity: '0.95'
        }}>
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.phone && <span>•</span>}
          {contactInfo.phone && <span>{contactInfo.phone}</span>}
          {contactInfo.location && <span>•</span>}
          {contactInfo.location && <span>{contactInfo.location}</span>}
        </div>
      </div>

      {sections.map((section, idx) => (
        <div key={idx} style={{ 
          marginBottom: '20px', 
          marginLeft: '15px',
          paddingLeft: '20px',
          borderLeft: '3px solid #7c3aed'
        }}>
          <h2 style={{ 
            fontSize: '14pt', 
            fontWeight: '700', 
            color: '#6d28d9', 
            textTransform: 'uppercase',
            marginBottom: '10px',
            letterSpacing: '1px'
          }}>
            {section.title}
          </h2>
          <ReactMarkdown
            components={{
              p: ({children}) => <p style={{ marginBottom: '10px', color: '#374151', lineHeight: '1.7' }}>{children}</p>,
              ul: ({children}) => <ul style={{ marginLeft: '25px', marginBottom: '12px' }}>{children}</ul>,
              li: ({children}) => <li style={{ marginBottom: '6px', color: '#4b5563' }}>{children}</li>,
              strong: ({children}) => <strong style={{ fontWeight: '700', color: '#1f2937' }}>{children}</strong>
            }}
          >
            {section.content.map(c => c.text).join('\n')}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );

  const renderFunctionalSkillBased = () => (
    <div className="bg-white" style={{ 
      maxWidth: '8.5in', 
      margin: '0 auto', 
      padding: '0.7in',
      fontFamily: '"Arial", sans-serif',
      fontSize: '11pt',
      lineHeight: '1.6',
      background: 'linear-gradient(to bottom, #fff7ed 0%, #ffffff 20%)',
      boxShadow: '0 4px 20px rgba(234,88,12,0.15)',
      color: '#1f2937'
    }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '8px',
        marginBottom: '25px',
        boxShadow: '0 4px 12px rgba(234,88,12,0.3)'
      }}>
        <h1 style={{ 
          fontSize: '34pt', 
          fontWeight: '700', 
          marginBottom: '10px',
          letterSpacing: '-0.5px'
        }}>
          {contactInfo.name || 'Your Name'}
        </h1>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '15px', 
          fontSize: '10.5pt',
          opacity: '0.95'
        }}>
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.phone && <span>•</span>}
          {contactInfo.phone && <span>{contactInfo.phone}</span>}
          {contactInfo.location && <span>•</span>}
          {contactInfo.location && <span>{contactInfo.location}</span>}
        </div>
      </div>

      {sections.map((section, idx) => (
        <div key={idx} style={{ 
          marginBottom: '20px', 
          padding: '15px',
          backgroundColor: '#fff7ed',
          borderRadius: '6px',
          borderLeft: '4px solid #ea580c'
        }}>
          <h2 style={{ 
            fontSize: '15pt', 
            fontWeight: '700', 
            color: '#ea580c',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {section.title}
          </h2>
          <ReactMarkdown
            components={{
              p: ({children}) => <p style={{ marginBottom: '10px', color: '#374151', lineHeight: '1.6' }}>{children}</p>,
              ul: ({children}) => <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>{children}</ul>,
              li: ({children}) => <li style={{ marginBottom: '6px', color: '#4b5563' }}>{children}</li>,
              strong: ({children}) => <strong style={{ fontWeight: '700', color: '#1f2937' }}>{children}</strong>
            }}
          >
            {section.content.map(c => c.text).join('\n')}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );

  const renderHybridBalanced = () => (
    <div className="bg-white" style={{ 
      maxWidth: '8.5in', 
      margin: '0 auto',
      fontFamily: '"Verdana", sans-serif',
      fontSize: '11pt',
      lineHeight: '1.6',
      border: '2px solid #22d3ee',
      boxShadow: '0 0 20px rgba(34,211,238,0.2)',
      color: '#1f2937'
    }}>
      <div style={{ 
        background: '#0891b2',
        color: 'white',
        padding: '28px 0.7in',
        marginBottom: '25px'
      }}>
        <h1 style={{ 
          fontSize: '28pt', 
          fontWeight: '700', 
          marginBottom: '8px',
          letterSpacing: '0.5px'
        }}>
          {contactInfo.name || 'Your Name'}
        </h1>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '12px', 
          fontSize: '10.5pt',
          opacity: '0.95'
        }}>
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.phone && <span>|</span>}
          {contactInfo.phone && <span>{contactInfo.phone}</span>}
          {contactInfo.location && <span>|</span>}
          {contactInfo.location && <span>{contactInfo.location}</span>}
        </div>
      </div>

      <div style={{ padding: '0 0.7in 0.7in' }}>
        {sections.map((section, idx) => (
          <div key={idx} style={{ 
            marginBottom: '20px', 
            padding: '15px',
            backgroundColor: '#ecfeff',
            borderRadius: '4px',
            borderLeft: '4px solid #0891b2'
          }}>
            <h2 style={{ 
              fontSize: '15pt', 
              fontWeight: '700', 
              color: '#0891b2',
              marginBottom: '10px',
              textTransform: 'uppercase'
            }}>
              {section.title}
            </h2>
            <ReactMarkdown
              components={{
                p: ({children}) => <p style={{ marginBottom: '10px', color: '#374151', lineHeight: '1.6' }}>{children}</p>,
                ul: ({children}) => <ul style={{ marginLeft: '20px', marginBottom: '12px' }}>{children}</ul>,
                li: ({children}) => <li style={{ marginBottom: '6px', color: '#4b5563' }}>{children}</li>,
                strong: ({children}) => <strong style={{ fontWeight: '700', color: '#1f2937' }}>{children}</strong>
              }}
            >
              {section.content.map(c => c.text).join('\n')}
            </ReactMarkdown>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTechFocused = () => (
    <div style={{ 
      maxWidth: '8.5in', 
      margin: '0 auto', 
      padding: '0.6in',
      background: '#111827',
      color: '#f3f4f6',
      fontFamily: '"Courier New", "Consolas", monospace',
      fontSize: '10.5pt',
      lineHeight: '1.6',
      boxShadow: '0 0 30px rgba(16,185,129,0.2)',
      border: '1px solid #065f46'
    }}>
      <div style={{ 
        background: '#065f46',
        padding: '25px',
        borderRadius: '6px',
        marginBottom: '25px',
        border: '1px solid #10b981'
      }}>
        <h1 style={{ 
          fontSize: '26pt', 
          fontWeight: '700', 
          color: 'white',
          marginBottom: '8px',
          fontFamily: '"Courier New", monospace'
        }}>
          {contactInfo.name || 'Your Name'}
        </h1>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '15px', 
          fontSize: '10pt',
          color: '#a7f3d0'
        }}>
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.phone && <span>•</span>}
          {contactInfo.phone && <span>{contactInfo.phone}</span>}
          {contactInfo.location && <span>•</span>}
          {contactInfo.location && <span>{contactInfo.location}</span>}
        </div>
      </div>

      {sections.map((section, idx) => (
        <div key={idx} style={{ 
          marginBottom: '20px', 
          padding: '18px',
          background: '#1f2937',
          borderRadius: '4px',
          borderLeft: '3px solid #10b981'
        }}>
          <h2 style={{ 
            fontSize: '13pt', 
            fontWeight: '700', 
            color: '#10b981',
            marginBottom: '10px',
            fontFamily: '"Courier New", monospace'
          }}>
            {'> '}{section.title.toUpperCase()}
          </h2>
          <ReactMarkdown
            components={{
              p: ({children}) => <p style={{ marginBottom: '10px', color: '#d1d5db', lineHeight: '1.6' }}>{children}</p>,
              ul: ({children}) => <ul style={{ listStyle: 'none', marginLeft: '0', marginBottom: '12px', padding: 0 }}>{children}</ul>,
              li: ({children}) => (
                <li style={{ 
                  marginBottom: '8px', 
                  color: '#d1d5db',
                  paddingLeft: '20px',
                  position: 'relative'
                }}>
                  <span style={{ 
                    position: 'absolute', 
                    left: '0', 
                    color: '#10b981',
                    fontWeight: 'bold'
                  }}>→</span>
                  <span>{children}</span>
                </li>
              ),
              strong: ({children}) => <strong style={{ fontWeight: '700', color: 'white' }}>{children}</strong>
            }}
          >
            {section.content.map(c => c.text).join('\n')}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );

  const renderAcademicResearch = () => (
    <div className="bg-white" style={{ 
      maxWidth: '8.5in', 
      margin: '0 auto', 
      padding: '0.75in',
      fontFamily: '"Times New Roman", serif',
      fontSize: '11pt',
      lineHeight: '1.7',
      border: '1px solid #fce7f3',
      boxShadow: '0 2px 15px rgba(190,24,93,0.1)',
      color: '#1f2937'
    }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px', 
        paddingBottom: '20px', 
        borderBottom: '2px solid #be185d' 
      }}>
        <h1 style={{ 
          fontSize: '26pt', 
          fontWeight: '700', 
          color: '#9f1239',
          marginBottom: '10px',
          fontFamily: '"Times New Roman", serif'
        }}>
          {contactInfo.name || 'Your Name'}
        </h1>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          gap: '15px', 
          fontSize: '10pt', 
          color: '#831843'
        }}>
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.phone && <span>•</span>}
          {contactInfo.phone && <span>{contactInfo.phone}</span>}
          {contactInfo.location && <span>•</span>}
          {contactInfo.location && <span>{contactInfo.location}</span>}
        </div>
      </div>

      {sections.map((section, idx) => (
        <div key={idx} style={{ 
          marginBottom: '22px', 
          paddingBottom: '18px',
          borderBottom: '1px solid #fbcfe8'
        }}>
          <h2 style={{ 
            fontSize: '15pt', 
            fontWeight: '700', 
            color: '#be185d',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {section.title}
          </h2>
          <ReactMarkdown
            components={{
              p: ({children}) => <p style={{ marginBottom: '10px', color: '#374151', lineHeight: '1.8' }}>{children}</p>,
              ul: ({children}) => <ul style={{ marginLeft: '25px', marginBottom: '12px' }}>{children}</ul>,
              li: ({children}) => <li style={{ marginBottom: '7px', color: '#4b5563' }}>{children}</li>,
              strong: ({children}) => <strong style={{ fontWeight: '700', color: '#1f2937' }}>{children}</strong>
            }}
          >
            {section.content.map(c => c.text).join('\n')}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );

  const renderExecutiveCV = () => (
    <div className="bg-white" style={{ 
      maxWidth: '8.5in', 
      margin: '0 auto', 
      padding: '0.8in',
      fontFamily: '"Georgia", serif',
      fontSize: '12pt',
      lineHeight: '1.7',
      background: 'linear-gradient(to bottom, #fef3c7 0%, #ffffff 15%)',
      boxShadow: '0 4px 25px rgba(180,83,9,0.15)',
      color: '#1f2937'
    }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)',
        color: 'white',
        padding: '40px',
        borderRadius: '8px',
        marginBottom: '30px',
        boxShadow: '0 6px 20px rgba(180,83,9,0.3)'
      }}>
        <h1 style={{ 
          fontSize: '38pt', 
          fontWeight: '700', 
          marginBottom: '12px',
          letterSpacing: '-1px',
          fontFamily: '"Georgia", serif'
        }}>
          {contactInfo.name || 'Your Name'}
        </h1>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '20px', 
          fontSize: '11.5pt',
          opacity: '0.95',
          fontWeight: '300'
        }}>
          {contactInfo.email && <span>{contactInfo.email}</span>}
          {contactInfo.phone && <span>•</span>}
          {contactInfo.phone && <span>{contactInfo.phone}</span>}
          {contactInfo.location && <span>•</span>}
          {contactInfo.location && <span>{contactInfo.location}</span>}
        </div>
      </div>

      {sections.map((section, idx) => (
        <div key={idx} style={{ marginBottom: '28px' }}>
          <h2 style={{ 
            fontSize: '18pt', 
            fontWeight: '700', 
            color: '#b45309',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '2px solid #fcd34d'
          }}>
            {section.title}
          </h2>
          <ReactMarkdown
            components={{
              p: ({children}) => <p style={{ marginBottom: '12px', color: '#374151', lineHeight: '1.8', fontSize: '11.5pt' }}>{children}</p>,
              ul: ({children}) => <ul style={{ marginLeft: '25px', marginBottom: '15px' }}>{children}</ul>,
              li: ({children}) => <li style={{ marginBottom: '8px', color: '#4b5563', fontSize: '11pt' }}>{children}</li>,
              strong: ({children}) => <strong style={{ fontWeight: '700', color: '#1f2937' }}>{children}</strong>
            }}
          >
            {section.content.map(c => c.text).join('\n')}
          </ReactMarkdown>
        </div>
      ))}
    </div>
  );

  // Template selector
  const templateRenderers = {
    'professional-classic': renderProfessionalClassic,
    'modern-executive': renderModernExecutive,
    'creative-professional': renderCreativeProfessional,
    'minimalist-clean': renderMinimalistClean,
    'chronological-standard': renderChronologicalStandard,
    'functional-skill-based': renderFunctionalSkillBased,
    'hybrid-balanced': renderHybridBalanced,
    'tech-focused': renderTechFocused,
    'academic-research': renderAcademicResearch,
    'executive-cv': renderExecutiveCV
  };

  const renderTemplate = templateRenderers[templateId] || renderMinimalistClean;

  return (
    <div style={{ 
      background: '#f8fafc', 
      padding: '30px 20px', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '8.5in',
        background: 'white',
        boxShadow: '0 0 50px rgba(0,0,0,0.1)'
      }}>
        {renderTemplate()}
      </div>
    </div>
  );
};

export default ResumeTemplateRenderer;
