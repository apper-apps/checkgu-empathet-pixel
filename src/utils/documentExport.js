import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import React from "react";
import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import Error from "@/components/ui/Error";
// Utility function to wait for element to be properly rendered
const waitForElementToRender = (element, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      if (!element) {
        reject(new Error('Element not found'));
        return;
      }
      
      const rect = element.getBoundingClientRect();
      const hasValidDimensions = rect.width > 0 && rect.height > 0;
      const isVisible = rect.width > 0 && rect.height > 0 && 
                       window.getComputedStyle(element).display !== 'none' &&
                       window.getComputedStyle(element).visibility !== 'hidden';
      
      if (hasValidDimensions && isVisible) {
        resolve(element);
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Element did not render within ${timeout}ms. Dimensions: ${rect.width}x${rect.height}`));
      } else {
        setTimeout(checkElement, 100);
      }
    };
    
    checkElement();
  });
};

// Enhanced canvas capture with error handling
const captureElementToCanvas = async (element, options = {}) => {
  try {
    // Ensure element is properly rendered
    await waitForElementToRender(element);
    
    // Validate element dimensions
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      throw new Error(`Invalid element dimensions: ${rect.width}x${rect.height}`);
    }
    
    // Default options with error handling
    const canvasOptions = {
      useCORS: true,
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      width: rect.width,
      height: rect.height,
      ...options
    };
    
    // Capture with html2canvas
    const canvas = await html2canvas(element, canvasOptions);
    
    // Validate canvas dimensions
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error(`Generated canvas has invalid dimensions: ${canvas.width}x${canvas.height}`);
    }
    
    return canvas;
  } catch (error) {
    console.error('Canvas capture error:', error);
    throw new Error(`Failed to capture element: ${error.message}`);
  }
};

// Export timetable as PDF
export const exportTimetableToPDF = async (elementId = 'timetable-grid') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }
    
    // Show loading state
    const loadingToast = document.createElement('div');
    loadingToast.textContent = 'Generating PDF...';
    loadingToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#3b82f6;color:white;padding:12px 16px;border-radius:8px;z-index:9999;';
    document.body.appendChild(loadingToast);
    
    try {
      const canvas = await captureElementToCanvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`timetable-${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Success notification
      loadingToast.textContent = 'PDF exported successfully!';
      loadingToast.style.background = '#10b981';
      setTimeout(() => document.body.removeChild(loadingToast), 2000);
      
    } catch (captureError) {
      throw captureError;
    } finally {
      if (document.body.contains(loadingToast)) {
        document.body.removeChild(loadingToast);
      }
    }
    
  } catch (error) {
    console.error('PDF export error:', error);
    
    // Error notification
    const errorToast = document.createElement('div');
    errorToast.textContent = `Export failed: ${error.message}`;
    errorToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:12px 16px;border-radius:8px;z-index:9999;';
    document.body.appendChild(errorToast);
    setTimeout(() => document.body.removeChild(errorToast), 5000);
    
    throw error;
  }
};

// Export timetable as image
export const exportTimetableToImage = async (elementId = 'timetable-grid', format = 'png') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }
    
    const canvas = await captureElementToCanvas(element);
    const link = document.createElement('a');
    link.download = `timetable-${new Date().toISOString().split('T')[0]}.${format}`;
    link.href = canvas.toDataURL(`image/${format}`);
    link.click();
    
    return canvas;
  } catch (error) {
    console.error('Image export error:', error);
    throw error;
  }
};

// Print timetable
export const printTimetable = async (elementId = 'timetable-grid') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }
    
    await waitForElementToRender(element);
    
    const canvas = await captureElementToCanvas(element);
    const imgData = canvas.toDataURL('image/png');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Timetable</title>
          <style>
            body { margin: 0; padding: 20px; }
            img { max-width: 100%; height: auto; }
            @media print { 
              body { padding: 0; }
              img { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" alt="Timetable" />
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  } catch (error) {
    console.error('Print error:', error);
    throw error;
  }
};

// Export lesson plan as PDF
export const exportToPDF = async (lessonPlan) => {
  try {
    if (!lessonPlan) {
      throw new Error('Lesson plan data is required');
    }

    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set up fonts and styles
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    
    // Title
    pdf.text('Lesson Plan', 20, 20);
    
    // Reset font for content
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    
    let yPos = 40;
    const lineHeight = 8;
    const leftMargin = 20;
    const rightMargin = 190;
    
    // Helper function to add text with word wrap
    const addText = (label, value, isBold = false) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      pdf.text(`${label}:`, leftMargin, yPos);
      
      if (value && value.toString().trim()) {
        const lines = pdf.splitTextToSize(value.toString(), rightMargin - leftMargin - 30);
        pdf.setFont('helvetica', 'normal');
        pdf.text(lines, leftMargin + 30, yPos);
        yPos += lineHeight * lines.length;
      } else {
        yPos += lineHeight;
      }
      
      yPos += 2; // Extra spacing
    };

    // Add lesson plan details
    addText('Subject', lessonPlan.subject, true);
    addText('Topic', lessonPlan.topic);
    addText('Class', lessonPlan.class);
    addText('Duration', lessonPlan.duration);
    addText('Date', lessonPlan.date);
    addText('Teacher', lessonPlan.teacher);
    
    yPos += 5;
    addText('Learning Objectives', lessonPlan.objectives);
    addText('Materials Needed', lessonPlan.materials);
    addText('Teaching Methods', lessonPlan.methods);
    addText('Assessment Criteria', lessonPlan.assessment);
    addText('Homework/Follow-up', lessonPlan.homework);
    
    if (lessonPlan.notes) {
      yPos += 5;
      addText('Additional Notes', lessonPlan.notes);
    }

    // Add footer
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`,
        leftMargin,
        285
      );
    }

    // Generate filename
    const filename = `lesson-plan-${lessonPlan.subject || 'unknown'}-${lessonPlan.topic || 'topic'}-${new Date().toISOString().split('T')[0]}.pdf`
      .replace(/[^a-z0-9.-]/gi, '_')
      .toLowerCase();

    // Save the PDF
    pdf.save(filename);
    
    return pdf;
  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error(`Failed to export lesson plan to PDF: ${error.message}`);
  }
};

// Export lesson plan as DOCX
export const exportToDOCX = async (lessonPlan) => {
  try {
    if (!lessonPlan) {
      throw new Error('Lesson plan data is required');
    }

    // Create document sections
    const children = [
      // Title
      new Paragraph({
        children: [
          new TextRun({
            text: "Lesson Plan",
            bold: true,
            size: 32,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    ];

    // Helper function to add field
    const addField = (label, value) => {
      if (value && value.toString().trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${label}: `,
                bold: true,
              }),
              new TextRun({
                text: value.toString(),
              }),
            ],
            spacing: { after: 200 },
          })
        );
      }
    };

    // Add lesson plan details
    addField('Subject', lessonPlan.subject);
    addField('Topic', lessonPlan.topic);
    addField('Class', lessonPlan.class);
    addField('Duration', lessonPlan.duration);
    addField('Date', lessonPlan.date);
    addField('Teacher', lessonPlan.teacher);

    // Add sections with headings
    const addSection = (title, content) => {
      if (content && content.toString().trim()) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 24,
              }),
            ],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: content.toString(),
              }),
            ],
            spacing: { after: 300 },
          })
        );
      }
    };

    addSection('Learning Objectives', lessonPlan.objectives);
    addSection('Materials Needed', lessonPlan.materials);
    addSection('Teaching Methods', lessonPlan.methods);
    addSection('Assessment Criteria', lessonPlan.assessment);
    addSection('Homework/Follow-up', lessonPlan.homework);
    
    if (lessonPlan.notes) {
      addSection('Additional Notes', lessonPlan.notes);
    }

    // Add footer
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated on ${new Date().toLocaleDateString()}`,
            italics: true,
            size: 20,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 600 },
      })
    );

    // Create document
    const doc = new Document({
      sections: [
        {
          children: children,
        },
      ],
    });

    // Generate filename
    const filename = `lesson-plan-${lessonPlan.subject || 'unknown'}-${lessonPlan.topic || 'topic'}-${new Date().toISOString().split('T')[0]}.docx`
      .replace(/[^a-z0-9.-]/gi, '_')
      .toLowerCase();

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    
    return doc;
} catch (error) {
    console.error('DOCX export error:', error);
    throw new Error(`Failed to export lesson plan to DOCX: ${error.message}`);
  }
};