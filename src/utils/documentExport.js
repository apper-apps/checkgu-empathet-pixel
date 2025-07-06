import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import React from "react";
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