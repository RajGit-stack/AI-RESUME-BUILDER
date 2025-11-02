"""Service to generate HTML from resume templates"""
import markdown
import re
from typing import Optional, Dict

def extract_contact_info(content: str, personal_info: Optional[Dict] = None):
    """Extract contact information from content or personal_info"""
    if personal_info:
        return {
            'name': personal_info.get('name', ''),
            'email': personal_info.get('email', ''),
            'phone': personal_info.get('phone', ''),
            'location': personal_info.get('location', ''),
            'linkedin': personal_info.get('linkedin', ''),
            'portfolio': personal_info.get('portfolio', '')
        }
    
    info = {'name': '', 'email': '', 'phone': '', 'location': '', 'linkedin': '', 'portfolio': ''}
    lines = content.split('\n')
    
    for line in lines:
        if re.match(r'^#+\s+', line):
            info['name'] = re.sub(r'^#+\s+', '', line).strip()
        if '**Email:**' in line or 'email:' in line.lower() or 'Email:' in line:
            match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', line)
            if match:
                info['email'] = match.group(0)
        if '**Phone:**' in line or 'phone:' in line.lower() or 'Phone:' in line:
            match = re.search(r'[\d\+\-\(\)\s]+', line)
            if match:
                info['phone'] = match.group(0).strip()
        if '**Location:**' in line or 'location:' in line.lower() or 'Location:' in line:
            match = re.search(r':\s*(.+)', line)
            if match:
                info['location'] = match.group(1).strip()
        if '**LinkedIn:**' in line or 'linkedin:' in line.lower() or 'LinkedIn:' in line:
            match = re.search(r'https?://[^\s]+', line)
            if match:
                info['linkedin'] = match.group(0)
        if '**Portfolio:**' in line or 'portfolio:' in line.lower() or 'Portfolio:' in line:
            match = re.search(r'https?://[^\s]+', line)
            if match:
                info['portfolio'] = match.group(0)
    
    return info

def parse_content_sections(content: str):
    """Parse content into structured sections"""
    sections = []
    lines = content.split('\n')
    current_section = {'title': '', 'content': []}
    skip_header = True
    
    for line in lines:
        if skip_header and (line.startswith('# ') or line.startswith('## ')):
            skip_header = False
            if line.startswith('## '):
                current_section['title'] = line.replace('## ', '').strip()
            continue
        
        if line.startswith('## '):
            if current_section['title']:
                sections.append(current_section)
            current_section = {
                'title': line.replace('## ', '').strip(),
                'content': []
            }
        elif line.startswith('### '):
            current_section['content'].append({'type': 'subheading', 'text': line.replace('### ', '').strip()})
        elif line.strip() and not re.match(r'^\*\*.*\*\*:\s*$', line.strip()):
            if not ('**Email:**' in line or '**Phone:**' in line or '**Location:**' in line or 
                   '**LinkedIn:**' in line or '**Portfolio:**' in line or 
                   re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', line.strip())):
                current_section['content'].append({'type': 'text', 'text': line})
    
    if current_section['title']:
        sections.append(current_section)
    
    return sections

def generate_template_html(content: str, template: Optional[Dict] = None, personal_info: Optional[Dict] = None, customization: Optional[Dict] = None, one_page: bool = True) -> str:
    """Generate HTML from resume content using the specified template"""
    
    template_id = 'minimalist-clean'
    if template and isinstance(template, dict):
        template_id = template.get('id', 'minimalist-clean')
    
    # Debug: Print template being used
    print(f"[DEBUG] Generating HTML for template: {template_id}")
    
    contact_info = extract_contact_info(content, personal_info)
    sections = parse_content_sections(content)
    
    # Apply customizations
    custom = customization or {}
    two_column = custom.get('two_column', False)
    bold_sections = custom.get('bold_sections', False)
    font_size = custom.get('font_size', 'medium')
    header_color = custom.get('header_color', None)
    accent_color = custom.get('accent_color', None)
    spacing = custom.get('spacing', 'normal')
    custom_css = custom.get('custom_css', '')
    
    # Font size mapping
    font_sizes = {
        'small': {'base': '9pt', 'name': '20pt', 'section': '10pt'},
        'medium': {'base': '10pt', 'name': '22pt', 'section': '11pt'},
        'large': {'base': '11pt', 'name': '24pt', 'section': '12pt'}
    }
    fonts = font_sizes.get(font_size, font_sizes['medium'])
    
    # Spacing mapping for one-page
    spacing_map = {
        'compact': {'padding': '0.4in', 'margin_section': '12px', 'margin_item': '4px'},
        'normal': {'padding': '0.5in', 'margin_section': '15px', 'margin_item': '6px'},
        'loose': {'padding': '0.6in', 'margin_section': '20px', 'margin_item': '8px'}
    }
    spacing_vals = spacing_map.get(spacing, spacing_map['normal'])
    
    # Apply one-page constraint - reduce spacing if needed
    if one_page:
        spacing_vals['padding'] = '0.4in'
        spacing_vals['margin_section'] = '10px'
        spacing_vals['margin_item'] = '4px'
        fonts = {'base': '9.5pt', 'name': '20pt', 'section': '10.5pt'}
    
    # Default colors based on template
    template_colors = {
        'professional-classic': {'header': '#2563eb', 'accent': '#2563eb'},
        'modern-executive': {'header': '#047857', 'accent': '#059669'},
        'creative-professional': {'header': '#dc2626', 'accent': '#dc2626'},
        'minimalist-clean': {'header': '#1e293b', 'accent': '#475569'},
        'chronological-standard': {'header': '#6d28d9', 'accent': '#7c3aed'},
        'functional-skill-based': {'header': '#ea580c', 'accent': '#ea580c'},
        'hybrid-balanced': {'header': '#0891b2', 'accent': '#0891b2'},
        'tech-focused': {'header': '#10b981', 'accent': '#10b981'},
        'academic-research': {'header': '#be185d', 'accent': '#be185d'},
        'executive-cv': {'header': '#b45309', 'accent': '#b45309'}
    }
    defaults = template_colors.get(template_id, template_colors['minimalist-clean'])
    if not header_color:
        header_color = defaults['header']
    if not accent_color:
        accent_color = defaults['accent']
    
    # Convert markdown content to HTML for sections
    md = markdown.Markdown(extensions=['nl2br', 'fenced_code'])
    
    # Build CSS with customizations
    section_font_weight = '700' if bold_sections else '600'
    layout_class = 'two-column' if two_column else ''
    column_style = 'display: grid; grid-template-columns: 2fr 1fr; gap: 20px;' if two_column else ''
    
    # Tech Focused Template - Dark theme with monospace font (must be before other templates)
    if template_id == 'tech-focused':
        html = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{
            size: letter;
            margin: 0;
            background: #111827;
        }}
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        html, body {{
            width: 100%;
            height: 100%;
            overflow: hidden;
        }}
        body {{
            width: 8.5in;
            min-height: 11in;
            max-height: 11in;
            margin: 0 auto;
            padding: {spacing_vals['padding']};
            background: #111827 !important;
            color: #f3f4f6 !important;
            font-family: "Courier New", Consolas, monospace !important;
            font-size: {fonts['base']};
            line-height: 1.4;
            page-break-inside: avoid;
            overflow: hidden;
        }}
        .header {{
            background: #065f46 !important;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: {spacing_vals['margin_section']};
            border: 1px solid #10b981 !important;
        }}
        .name {{
            font-size: {fonts['name']};
            font-weight: 700;
            color: white !important;
            margin-bottom: 6px;
            font-family: "Courier New", monospace;
        }}
        .contact {{
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            font-size: {fonts['base']};
            color: #a7f3d0 !important;
        }}
        .section {{
            margin-bottom: {spacing_vals['margin_section']};
            padding: 12px;
            background: #1f2937 !important;
            border-radius: 4px;
            border-left: 3px solid {accent_color} !important;
            page-break-inside: avoid;
        }}
        .section-title {{
            font-size: {fonts['section']};
            font-weight: {section_font_weight};
            color: {accent_color} !important;
            margin-bottom: 6px;
            font-family: "Courier New", monospace;
        }}
        .content {{
            color: #d1d5db !important;
            line-height: 1.4;
            font-size: {fonts['base']};
        }}
        .content p {{
            margin-bottom: {spacing_vals['margin_item']};
            color: #d1d5db !important;
        }}
        .content ul {{
            list-style: none !important;
            margin-left: 0;
            margin-bottom: 8px;
            padding: 0;
        }}
        .content li {{
            margin-bottom: {spacing_vals['margin_item']};
            color: #d1d5db !important;
            padding-left: 18px;
            position: relative;
        }}
        .content li:before {{
            content: "→";
            position: absolute;
            left: 0;
            color: {accent_color} !important;
            font-weight: bold;
        }}
        /* Fallback for PDF compatibility */
        .bullet {{
            color: {accent_color} !important;
            margin-right: 8px;
            font-weight: bold;
        }}
        .content strong {{
            font-weight: 700;
            color: white !important;
        }}
        .content em {{
            color: #d1d5db !important;
        }}
        {custom_css}
    </style>
</head>
<body style="background: #111827 !important;">
    <div class="header">
        <div class="name">{contact_info['name'] or 'Your Name'}</div>
        <div class="contact">
            {f"<span>{contact_info['email']}</span>" if contact_info['email'] else ""}
            {f"<span>•</span><span>{contact_info['phone']}</span>" if contact_info['phone'] else ""}
            {f"<span>•</span><span>{contact_info['location']}</span>" if contact_info['location'] else ""}
        </div>
    </div>
'''
        for section in sections:
            section_html = md.convert('\n'.join([c['text'] for c in section['content']]))
            # Post-process HTML to add custom bullets for PDF compatibility
            import re
            # Replace <li> tags with custom styled bullets
            section_html = re.sub(r'<li>', r'<li><span class="bullet">→</span>', section_html)
            html += f'''
    <div class="section">
        <div class="section-title">&gt; {section['title'].upper()}</div>
        <div class="content">{section_html}</div>
    </div>
'''
        html += '</body></html>'
        return html
    
    # Professional Classic Template
    if template_id == 'professional-classic':
        html = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{
            size: letter;
            margin: 0;
        }}
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        html, body {{
            width: 100%;
            height: 100%;
            overflow: hidden;
        }}
        body {{
            width: 8.5in;
            min-height: 11in;
            max-height: 11in;
            margin: 0 auto;
            padding: {spacing_vals['padding']};
            font-family: Calibri, Arial, sans-serif;
            font-size: {fonts['base']};
            line-height: 1.35;
            color: #2c3e50;
            page-break-inside: avoid;
            overflow: hidden;
        }}
        .header {{
            border-bottom: 3px solid {accent_color} !important;
            padding-bottom: {spacing_vals['margin_item']};
            margin-bottom: {spacing_vals['margin_section']};
        }}
        .name {{
            font-size: {fonts['name']};
            font-weight: 700;
            color: {header_color} !important;
            margin-bottom: 4px;
            letter-spacing: 0.5px;
            font-family: Georgia, serif;
        }}
        .contact {{
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            font-size: {fonts['base']};
            color: #64748b;
        }}
        .main-content {{
            {column_style}
        }}
        .section {{
            margin-bottom: {spacing_vals['margin_section']};
            page-break-inside: avoid;
        }}
        .section-title {{
            font-size: {fonts['section']};
            font-weight: {section_font_weight};
            color: {accent_color} !important;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
            padding-bottom: 3px;
            border-bottom: 2px solid {accent_color};
        }}
        .content {{
            color: #374151;
            line-height: 1.5;
        }}
        .content p {{ margin-bottom: {spacing_vals['margin_item']}; }}
        .content ul {{ margin-left: 18px; margin-bottom: 8px; }}
        .content li {{ margin-bottom: {spacing_vals['margin_item']}; color: #4b5563; font-size: {fonts['base']}; }}
        .content strong {{ font-weight: 700; color: #1f2937; }}
        {custom_css}
    </style>
</head>
<body>
    <div class="header">
        <div class="name" style="color: {header_color} !important;">{contact_info['name'] or 'Your Name'}</div>
        <div class="contact">
            {f"<span>{contact_info['email']}</span>" if contact_info['email'] else ""}
            {f"<span style='color: #94a3b8;'>|</span><span>{contact_info['phone']}</span>" if contact_info['phone'] else ""}
            {f"<span style='color: #94a3b8;'>|</span><span>{contact_info['location']}</span>" if contact_info['location'] else ""}
            {f"<span style='color: #94a3b8;'>|</span><span>LinkedIn: {contact_info['linkedin'].replace('https://', '').replace('http://', '')}</span>" if contact_info['linkedin'] else ""}
        </div>
    </div>
    <div class="main-content {layout_class}">
'''
        for section in sections:
            section_html = md.convert('\n'.join([c['text'] for c in section['content']]))
            html += f'''
        <div class="section">
            <div class="section-title" style="color: {accent_color} !important; border-bottom-color: {accent_color} !important;">{section['title']}</div>
            <div class="content">{section_html}</div>
        </div>
'''
        html += '''
    </div>
</body>
</html>'''
        return html
    
    # Minimalist Clean Template (default)
    html = f'''<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{
            size: letter;
            margin: 0;
        }}
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        html, body {{
            width: 100%;
            height: 100%;
            overflow: hidden;
        }}
        body {{
            width: 8.5in;
            min-height: 11in;
            max-height: 11in;
            margin: 0 auto;
            padding: {spacing_vals['padding']};
            font-family: Arial, Calibri, sans-serif;
            font-size: {fonts['base']};
            line-height: 1.35;
            color: #1f2937;
            page-break-inside: avoid;
            overflow: hidden;
        }}
        .header {{
            text-align: center;
            margin-bottom: {spacing_vals['margin_section']};
            padding-bottom: {spacing_vals['margin_item']};
            border-bottom: 1px solid #e5e7eb;
        }}
        .name {{
            font-size: {fonts['name']};
            font-weight: 300;
            color: {header_color};
            margin-bottom: 4px;
            letter-spacing: 3px;
            text-transform: uppercase;
        }}
        .contact {{
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 8px;
            font-size: {fonts['base']};
            color: #64748b;
        }}
        .main-content {{
            {column_style}
        }}
        .section {{
            margin-bottom: {spacing_vals['margin_section']};
            page-break-inside: avoid;
        }}
        .section-title {{
            font-size: {fonts['section']};
            font-weight: {section_font_weight};
            color: {accent_color} !important;
            text-transform: uppercase;
            letter-spacing: 2px;
            margin-bottom: 4px;
        }}
        .section-divider {{
            margin-bottom: {spacing_vals['margin_item']};
            border-top: 1px solid #e2e8f0;
            height: 1px;
        }}
        .content {{
            color: #374151;
            line-height: 1.5;
            font-size: {fonts['base']};
        }}
        .content p {{ margin-bottom: {spacing_vals['margin_item']}; }}
        .content ul {{ margin-left: 18px; margin-bottom: 8px; }}
        .content li {{ margin-bottom: {spacing_vals['margin_item']}; color: #4b5563; }}
        .content strong {{ font-weight: 600; }}
        {custom_css}
    </style>
</head>
<body>
    <div class="header">
        <div class="name">{contact_info['name'] or 'Your Name'}</div>
        <div class="contact">
            {f"<span>{contact_info['email']}</span>" if contact_info['email'] else ""}
            {f"<span>|</span><span>{contact_info['phone']}</span>" if contact_info['phone'] else ""}
            {f"<span>|</span><span>{contact_info['location']}</span>" if contact_info['location'] else ""}
        </div>
    </div>
    <div class="main-content {layout_class}">
'''
    
    for section in sections:
        section_html = md.convert('\n'.join([c['text'] for c in section['content']]))
        html += f'''
        <div class="section">
            <div class="section-title" style="color: {accent_color} !important;">{section['title']}</div>
            <div class="section-divider"></div>
            <div class="content">{section_html}</div>
        </div>
'''
    
    html += '''
    </div>
</body>
</html>'''
    return html

