import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";
import React from "react";
import Error from "@/components/ui/Error";
// Enhanced element validation for canvas operations
const validateElementForCapture = (element) => {
  if (!element) {
    throw new Error('Element is required for viewport capture')
  }

  const rect = element.getBoundingClientRect()
  const style = window.getComputedStyle(element)

  // Check basic dimensions
  if (rect.width <= 0 || rect.height <= 0) {
    throw new Error(`Element has invalid dimensions: ${rect.width}x${rect.height}`)
  }

  // Check visibility
  if (style.visibility === 'hidden' || style.display === 'none' || style.opacity === '0') {
    throw new Error('Element is not visible')
  }

  // Check minimum size requirements for canvas operations
  if (rect.width < 50 || rect.height < 50) {
    throw new Error(`Element too small for capture: ${rect.width}x${rect.height}. Minimum 50x50 required.`)
  }

  // Check if element is in viewport
  const isInViewport = (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )

  return {
    isValid: true,
    dimensions: { width: rect.width, height: rect.height },
    isInViewport,
    style: {
      visibility: style.visibility,
      display: style.display,
      opacity: style.opacity
    }
  }
}

// Wait for element to be ready for export
const waitForElementReady = async (element, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const checkReady = () => {
      try {
        const validation = validateElementForCapture(element)
        
        // Enhanced checks for TimetableGrid readiness
        const exportReady = element.dataset?.exportReady === 'true'
        const isVisible = element.dataset?.isVisible === 'true'
        const dimensions = element.dataset?.dimensions
        
        // Parse dimensions if available
        let hasSufficientDimensions = false
        if (dimensions) {
          const [width, height] = dimensions.split('x').map(Number)
          hasSufficientDimensions = width >= 50 && height >= 50
        }
        
        // Element must be valid AND have proper export readiness
        if (validation.isValid && exportReady && isVisible && hasSufficientDimensions) {
          console.log('Element ready for export:', { 
            dimensions: validation.dimensions, 
            exportReady, 
            isVisible,
            hasSufficientDimensions
          })
          resolve(validation)
          return
        }
        
        // Timeout check
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Element not ready for export after ${timeout}ms. Status: exportReady=${exportReady}, isVisible=${isVisible}, dimensions=${dimensions}`))
          return
        }
        
        // Continue checking
        setTimeout(checkReady, 100)
      } catch (error) {
        if (Date.now() - startTime > timeout) {
          reject(error)
        } else {
          setTimeout(checkReady, 100)
        }
      }
    }
    
checkReady()
  })
}

// Enhanced viewport capture with comprehensive validation
export const captureViewport = async (element, options = {}) => {
  try {
    console.log('Starting viewport capture...')
    
    // Enhanced element validation
    if (!element) {
      throw new Error('Canvas capture failed: No element provided')
    }
    
    if (!element.isConnected) {
      throw new Error('Canvas capture failed: Element is not connected to DOM')
    }
    
    // Wait for element to be ready with comprehensive validation
    const validation = await waitForElementReady(element, options.timeout || 10000)
    console.log('Element validation passed:', validation)

    // Multiple rounds of dimension validation
    const rect = element.getBoundingClientRect()
    console.log('Element dimensions:', rect)
    
    if (!rect || rect.width <= 0 || rect.height <= 0) {
      throw new Error(`Canvas capture failed: Element has zero dimensions (${rect?.width || 0}x${rect?.height || 0})`)
    }

    // Ensure minimum dimensions for canvas operations
    if (rect.width < 50 || rect.height < 50) {
      throw new Error(`Canvas capture failed: Element dimensions too small (${rect.width}x${rect.height}). Minimum 50x50 required.`)
    }

    // Enhanced visibility checks
    const computedStyle = window.getComputedStyle(element)
    if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
      throw new Error('Canvas capture failed: Element is not visible')
    }
    
    if (parseFloat(computedStyle.opacity) === 0) {
      throw new Error('Canvas capture failed: Element has zero opacity')
    }

    // Check element readiness via data attributes
    const isReady = element.dataset?.exportReady === 'true'
    const isVisible = element.dataset?.isVisible === 'true'
    
    if (!isReady || !isVisible) {
      throw new Error(`Canvas capture failed: Element not ready for export (ready: ${isReady}, visible: ${isVisible})`)
    }

    console.log('Pre-capture validation passed. Capturing element with dimensions:', rect.width, 'x', rect.height)

    // Enhanced canvas generation with error handling
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: Math.min(2, window.devicePixelRatio || 1),
      logging: false,
      width: Math.floor(rect.width),
      height: Math.floor(rect.height),
      windowWidth: Math.floor(rect.width),
      windowHeight: Math.floor(rect.height),
      onclone: (clonedDoc) => {
        // Ensure cloned document has proper dimensions
        const clonedElement = clonedDoc.querySelector(`#${element.id}`)
        if (clonedElement) {
          clonedElement.style.width = `${rect.width}px`
          clonedElement.style.height = `${rect.height}px`
          clonedElement.style.minWidth = `${rect.width}px`
          clonedElement.style.minHeight = `${rect.height}px`
        }
      },
      ...options
    })

    // Comprehensive canvas validation
    if (!canvas) {
      throw new Error('Canvas generation failed: html2canvas returned null')
    }
    
    if (canvas.width <= 0 || canvas.height <= 0) {
      throw new Error(`Canvas generation failed: Invalid canvas dimensions (${canvas.width}x${canvas.height})`)
    }

    // Additional canvas validation
    if (canvas.width < 50 || canvas.height < 50) {
      throw new Error(`Canvas generation failed: Generated canvas too small (${canvas.width}x${canvas.height})`)
    }

    // Test canvas context
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('Canvas generation failed: Could not get 2D context')
    }

    console.log('Canvas capture successful:', canvas.width, 'x', canvas.height)
    return canvas
  } catch (error) {
    console.error('Error capturing viewport:', error)
    
    // Provide detailed error information
    const errorDetails = {
      message: error.message,
      elementPresent: !!element,
      elementConnected: element?.isConnected,
      elementDimensions: element ? element.getBoundingClientRect() : null,
      elementStyle: element ? {
        display: window.getComputedStyle(element).display,
        visibility: window.getComputedStyle(element).visibility,
        opacity: window.getComputedStyle(element).opacity
      } : null,
      elementDataAttributes: element ? {
        exportReady: element.dataset?.exportReady,
        isVisible: element.dataset?.isVisible,
        dimensions: element.dataset?.dimensions
      } : null,
      timestamp: new Date().toISOString()
    }
    
    console.error('Capture error details:', errorDetails)
    throw new Error(`Failed to capture viewport: ${error.message}`)
  }
}

// Export timetable to PDF with enhanced error handling
export const exportToPDF = async (element, filename = 'timetable.pdf') => {
  try {
    console.log('Starting PDF export...')
    
    // Enhanced pre-flight checks
    if (!element) {
      throw new Error('Element is required for PDF export')
    }

    // Wait for element to be export-ready
    console.log('Waiting for element to be ready for export...')
    const canvas = await captureViewport(element, { timeout: 10000 })
    
    if (!canvas || canvas.width <= 0 || canvas.height <= 0) {
      throw new Error('Invalid canvas for PDF generation')
    }

    console.log('Canvas ready for PDF generation:', canvas.width, 'x', canvas.height)

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const imgData = canvas.toDataURL('image/png')
    if (!imgData || imgData === 'data:,') {
      throw new Error('Failed to generate image data from canvas')
    }

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    
    // Calculate scaling to fit page
    const canvasAspectRatio = canvas.width / canvas.height
    const pdfAspectRatio = pdfWidth / pdfHeight
    
    let finalWidth, finalHeight, x, y
    if (canvasAspectRatio > pdfAspectRatio) {
      finalWidth = pdfWidth
      finalHeight = pdfWidth / canvasAspectRatio
      x = 0
      y = (pdfHeight - finalHeight) / 2
    } else {
      finalHeight = pdfHeight
      finalWidth = pdfHeight * canvasAspectRatio
      x = (pdfWidth - finalWidth) / 2
      y = 0
    }

    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight)
    pdf.save(filename)
    
    console.log('PDF export successful:', filename)
  } catch (error) {
    console.error('Error exporting PDF:', error)
    throw new Error(`Failed to export PDF: ${error.message}`)
}
}

// Export timetable to PNG with validation
export const exportToPNG = async (element, filename = 'timetable.png') => {
  try {
    console.log('Starting PNG export...')
    const canvas = await captureViewport(element, { timeout: 10000 })
    
    if (!canvas || canvas.width <= 0 || canvas.height <= 0) {
      throw new Error('Invalid canvas for PNG generation')
    }

    const imageData = canvas.toDataURL('image/png')
    if (!imageData || imageData === 'data:,') {
      throw new Error('Failed to generate PNG data from canvas')
    }

    // Create download link
    const link = document.createElement('a')
    link.download = filename
    link.href = imageData
    link.click()
    
    console.log('PNG export successful:', filename)
  } catch (error) {
    console.error('Error exporting PNG:', error)
    throw new Error(`Failed to export PNG: ${error.message}`)
  }
}

// Enhanced element readiness validation
const waitForElementToRender = async (element, timeout = 10000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now()
    
    const checkReady = () => {
      try {
        if (!element || !element.isConnected) {
          reject(new Error('Element not found or not connected to DOM'))
          return
        }
        
        const rect = element.getBoundingClientRect()
        const computedStyle = window.getComputedStyle(element)
        
        // Check dimensions
        if (rect.width > 50 && rect.height > 50) {
          // Check visibility
          if (computedStyle.display !== 'none' && 
              computedStyle.visibility !== 'hidden' && 
              parseFloat(computedStyle.opacity) > 0) {
            // Check element readiness via data attributes
            const isReady = element.dataset?.exportReady === 'true'
            const isVisible = element.dataset?.isVisible === 'true'
            
            if (isReady && isVisible) {
              resolve(true)
              return
            }
          }
        }
        
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Element not ready after ${timeout}ms. Dimensions: ${rect.width}x${rect.height}, Ready: ${element.dataset?.exportReady}, Visible: ${element.dataset?.isVisible}`))
          return
        }
        
        setTimeout(checkReady, 100)
      } catch (error) {
        reject(error)
      }
    }
    
    checkReady()
  })
}

// Enhanced canvas capture with comprehensive validation
const captureElementToCanvas = async (element) => {
  try {
    await waitForElementToRender(element)
    
    const rect = element.getBoundingClientRect()
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: Math.min(2, window.devicePixelRatio || 1),
      logging: false,
      width: Math.floor(rect.width),
      height: Math.floor(rect.height),
      windowWidth: Math.floor(rect.width),
      windowHeight: Math.floor(rect.height)
    })
    
    if (!canvas || canvas.width <= 0 || canvas.height <= 0) {
      throw new Error(`Failed to generate canvas: ${canvas?.width || 0}x${canvas?.height || 0}`)
    }
    
    if (canvas.width < 50 || canvas.height < 50) {
      throw new Error(`Generated canvas too small: ${canvas.width}x${canvas.height}`)
    }
    
    return canvas
  } catch (error) {
    console.error('Canvas capture error:', error)
    throw error
  }
}

// Export timetable to PDF (alternative implementation)
export const exportTimetableToPDF = async (elementId = 'timetable-grid') => {
  let loadingToast = null
  
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`)
    }
    
    // Show loading notification
    loadingToast = document.createElement('div')
    loadingToast.textContent = 'Generating PDF...'
    loadingToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#3b82f6;color:white;padding:12px 16px;border-radius:8px;z-index:9999;'
    document.body.appendChild(loadingToast)
    
    // Enhanced element validation
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) {
      throw new Error(`Element not ready for export: ${rect.width}x${rect.height}`)
    }
    
    if (element.dataset?.exportReady !== 'true') {
      throw new Error('Element not ready for export. Please wait for the timetable to load completely.')
    }
    
    const canvas = await captureElementToCanvas(element)
    const imgData = canvas.toDataURL('image/png', 1.0)
    
    // Create PDF with proper dimensions
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height]
    })
    
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
    pdf.save(`timetable-${new Date().toISOString().split('T')[0]}.pdf`)
    
    // Success notification
    loadingToast.textContent = 'PDF exported successfully!'
    loadingToast.style.background = '#10b981'
    setTimeout(() => {
      if (loadingToast && document.body.contains(loadingToast)) {
        document.body.removeChild(loadingToast)
      }
    }, 2000)
    
  } catch (error) {
    console.error('PDF export error:', error)
    
    // Remove loading toast if it exists
    if (loadingToast && document.body.contains(loadingToast)) {
      document.body.removeChild(loadingToast)
    }
    
    // Error notification
    const errorToast = document.createElement('div')
    errorToast.textContent = `Export failed: ${error.message}`
    errorToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:12px 16px;border-radius:8px;z-index:9999;'
    document.body.appendChild(errorToast)
    setTimeout(() => {
      if (document.body.contains(errorToast)) {
        document.body.removeChild(errorToast)
      }
    }, 5000)
    
throw error
  }
}

// Export timetable as image
// Print timetable
export const exportTimetableToImage = async (elementId = 'timetable-grid', format = 'png') => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`)
    }
    
    // Enhanced element validation
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) {
      throw new Error(`Element not ready for export: ${rect.width}x${rect.height}`)
    }
    
    if (element.dataset?.exportReady !== 'true') {
      throw new Error('Element not ready for export. Please wait for the timetable to load completely.')
    }
    
    const canvas = await captureElementToCanvas(element)
    const link = document.createElement('a')
    link.download = `timetable-${new Date().toISOString().split('T')[0]}.${format}`
    link.href = canvas.toDataURL(`image/${format}`, 1.0)
    link.click()
    
    return canvas
  } catch (error) {
    console.error('Image export error:', error)
    
    // Show error notification
    const errorToast = document.createElement('div')
    errorToast.textContent = `Export failed: ${error.message}`
    errorToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:12px 16px;border-radius:8px;z-index:9999;'
    document.body.appendChild(errorToast)
    setTimeout(() => {
      if (document.body.contains(errorToast)) {
        document.body.removeChild(errorToast)
      }
    }, 5000)
    
    throw error
  }
}
export const printTimetable = async (elementId = 'timetable-grid') => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with ID '${elementId}' not found`)
    }
    
    // Enhanced element validation
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) {
      throw new Error(`Element not ready for export: ${rect.width}x${rect.height}`)
    }
    
    if (element.dataset?.exportReady !== 'true') {
      throw new Error('Element not ready for export. Please wait for the timetable to load completely.')
    }
    
    await waitForElementToRender(element)
    
    const canvas = await captureElementToCanvas(element)
    const imgData = canvas.toDataURL('image/png', 1.0)
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      throw new Error('Failed to open print window. Please check if popups are blocked.')
    }
    
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
    `)
    
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  } catch (error) {
    console.error('Print error:', error)
    
    // Show error notification
    const errorToast = document.createElement('div')
    errorToast.textContent = `Print failed: ${error.message}`
    errorToast.style.cssText = 'position:fixed;top:20px;right:20px;background:#ef4444;color:white;padding:12px 16px;border-radius:8px;z-index:9999;'
    document.body.appendChild(errorToast)
    setTimeout(() => {
      if (document.body.contains(errorToast)) {
        document.body.removeChild(errorToast)
      }
    }, 5000)
    
    throw error
  }
}

// Export lesson plan as PDF
export const exportLessonPlanToPDF = async (lessonPlan) => {
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