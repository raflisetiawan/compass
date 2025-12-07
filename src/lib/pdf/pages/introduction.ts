import { type PdfPageProps } from '../types';

export const addIntroductionPage = ({ doc }: PdfPageProps) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const maxWidth = pageWidth - (margin * 2);
    let currentY = 25;

    // Title: BeSpoke Decision Support Tool
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BeSpoke Decision Support Tool', pageWidth / 2, currentY, { align: 'center' });

    currentY += 10;

    // Subtitle
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('A patient decision aid for prostate cancer treatment options', pageWidth / 2, currentY, { align: 'center' });

    currentY += 15;

    // Horizontal line
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 15;

    // Section title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('The BeSpoke Decision Support tool', margin, currentY);

    currentY += 10;

    // Introduction paragraphs
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const paragraphs = [
        'We know it can be difficult to choose a treatment for prostate cancer. We want to help you understand the options that you have available.',
        'This tool provides information about how each treatment is carried out, how well it deals with the cancer and how it can affect your life.',
        'The cancer details, and your current health can affect this, so we will ask questions about how you are now to help you understand how different treatments might affect you.',
        'We will also ask what is most important to you when considering the different treatments.',
    ];

    paragraphs.forEach((paragraph) => {
        const lines = doc.splitTextToSize(paragraph, maxWidth);
        doc.text(lines, margin, currentY);
        currentY += (lines.length * 6) + 6;
    });

    currentY += 5;

    // Horizontal line
    doc.setLineWidth(0.3);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 15;

    // Personalised info section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const personalisedText = 'In order to give you personalised information, we need to ask you a few questions about yourself first. To help us give you the most accurate results, it is important that you answer all questions honestly and completely.';
    const personalisedLines = doc.splitTextToSize(personalisedText, maxWidth);
    doc.text(personalisedLines, margin, currentY);
};
