import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, TextRun } from "docx";
import { jsPDF } from "jspdf";
import { format } from "date-fns";
import React from "react";
import Error from "@/components/ui/Error";

export const exportToPDF = (lessonPlan) => {
  const doc = new jsPDF();
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = margin;

  // Helper function to add text with word wrapping
  const addText = (text, fontSize = 12, isBold = false) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    
    const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
    
    // Check if we need a new page
    if (yPosition + lines.length * fontSize * 0.4 > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
    
    doc.text(lines, margin, yPosition);
    yPosition += lines.length * fontSize * 0.4 + 5;
  };

  // Title
  addText("LESSON PLAN", 20, true);
  yPosition += 10;

  // Basic Information
  addText(`Filename: ${lessonPlan.filename}`, 14, true);
  addText(`Subject: ${lessonPlan.subject}`, 12);
  addText(`Class: ${lessonPlan.class}`, 12);
  addText(`Duration: ${lessonPlan.duration} minutes`, 12);
  addText(`Date: ${format(new Date(lessonPlan.date), 'MMMM dd, yyyy')}`, 12);
  yPosition += 10;

  // Content sections
  if (lessonPlan.objectives) {
    addText("LEARNING OBJECTIVES", 14, true);
    addText(lessonPlan.objectives, 12);
    yPosition += 5;
  }

  if (lessonPlan.materials) {
    addText("MATERIALS NEEDED", 14, true);
    addText(lessonPlan.materials, 12);
    yPosition += 5;
  }

  if (lessonPlan.activities) {
    addText("ACTIVITIES & PROCEDURES", 14, true);
    addText(lessonPlan.activities, 12);
    yPosition += 5;
  }

  if (lessonPlan.assessment) {
    addText("ASSESSMENT METHODS", 14, true);
    addText(lessonPlan.assessment, 12);
    yPosition += 5;
  }

  if (lessonPlan.homework) {
    addText("HOMEWORK ASSIGNMENT", 14, true);
    addText(lessonPlan.homework, 12);
    yPosition += 5;
  }

  if (lessonPlan.notes) {
    addText("ADDITIONAL NOTES", 14, true);
    addText(lessonPlan.notes, 12);
  }

  // Save the PDF
  doc.save(`${lessonPlan.filename}.pdf`);
};

export const exportToDOCX = async (lessonPlan) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "LESSON PLAN",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: "",
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Filename: ",
              bold: true,
            }),
            new TextRun({
              text: lessonPlan.filename,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Subject: ",
              bold: true,
            }),
            new TextRun({
              text: lessonPlan.subject,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Class: ",
              bold: true,
            }),
            new TextRun({
              text: lessonPlan.class,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Duration: ",
              bold: true,
            }),
            new TextRun({
              text: `${lessonPlan.duration} minutes`,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Date: ",
              bold: true,
            }),
            new TextRun({
              text: format(new Date(lessonPlan.date), 'MMMM dd, yyyy'),
            }),
          ],
        }),
        new Paragraph({
          text: "",
        }),
        ...(lessonPlan.objectives ? [
          new Paragraph({
            text: "LEARNING OBJECTIVES",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: lessonPlan.objectives,
          }),
          new Paragraph({
            text: "",
          }),
        ] : []),
        ...(lessonPlan.materials ? [
          new Paragraph({
            text: "MATERIALS NEEDED",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: lessonPlan.materials,
          }),
          new Paragraph({
            text: "",
          }),
        ] : []),
        ...(lessonPlan.activities ? [
          new Paragraph({
            text: "ACTIVITIES & PROCEDURES",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: lessonPlan.activities,
          }),
          new Paragraph({
            text: "",
          }),
        ] : []),
        ...(lessonPlan.assessment ? [
          new Paragraph({
            text: "ASSESSMENT METHODS",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: lessonPlan.assessment,
          }),
          new Paragraph({
            text: "",
          }),
        ] : []),
        ...(lessonPlan.homework ? [
          new Paragraph({
            text: "HOMEWORK ASSIGNMENT",
            heading: HeadingLevel.HEADING_2,
          }),
          new Paragraph({
            text: lessonPlan.homework,
          }),
          new Paragraph({
            text: "",
          }),
        ] : []),
        ...(lessonPlan.notes ? [
          new Paragraph({
            text: "ADDITIONAL NOTES",
            heading: HeadingLevel.HEADING_2,
new Paragraph({
            text: lessonPlan.notes,
          }),
        ] : []),
      ],
    }],
  });

  try {
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${lessonPlan.filename}.docx`;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error('Failed to generate DOCX document');
  }
};