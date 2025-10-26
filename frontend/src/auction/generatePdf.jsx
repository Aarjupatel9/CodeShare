import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// Enhanced PDF generation - one row per page
export const generatePDF = async (elementToPrintId, filename = "export") => {
    const element = document.getElementById(elementToPrintId);
    if (!element) {
        throw new Error(`Element with id ${elementToPrintId} not found`);
    }

    // Get all rows (each row contains 4 teams)
    const allRows = element.querySelectorAll('[class*="page-break-inside-avoid"]');
    const totalRows = allRows.length;
        
    const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true
    });

    // Process each row separately
    for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
        const rowElement = allRows[rowIndex];
        
        // Create a container for this specific row
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.width = element.scrollWidth + 'px';
        tempContainer.style.backgroundColor = '#ffffff';
        tempContainer.style.padding = '10px';
        
        // Clone the header (first child of the main element)
        const header = element.querySelector(':scope > :first-child');
        const clonedHeader = header.cloneNode(true);
        tempContainer.appendChild(clonedHeader);
        
        // Clone this specific row
        const clonedRow = rowElement.cloneNode(true);
        tempContainer.appendChild(clonedRow);
        
        document.body.appendChild(tempContainer);
        
        try {
            const canvas = await html2canvas(tempContainer, { 
                scale: 2,
                useCORS: true, 
                logging: false,
                allowTaint: true,
                backgroundColor: '#ffffff',
                removeContainer: true,
                imageTimeout: 0,
                onclone: (clonedDoc) => {
                    // Ensure proper spacing and prevent overlap
                    const textElements = clonedDoc.querySelectorAll('span, div, p, h1, h2, h3');
                    textElements.forEach(el => {
                        el.style.lineHeight = '2';
                        el.style.wordWrap = 'break-word';
                        el.style.overflowWrap = 'break-word';
                    });
                    
                    // Find and preserve spaces in auction name by creating a text representation
                    const auctionNameElement = clonedDoc.querySelector('#header-auction-name');
                    if (auctionNameElement) {
                        const originalText = auctionNameElement.textContent;
                        
                        // Replace ALL spaces with a visible space character that won't be collapsed
                        // Using a combination of approaches
                        const textWithVisibleSpaces = originalText.split('').map(char => {
                            if (char === ' ') {
                                return '\u00A0'; // Non-breaking space
                            }
                            return char;
                        }).join('');
                        
                        
                        // Replace the entire content
                        auctionNameElement.innerHTML = textWithVisibleSpaces;
                        
                        // Set all preservation styles
                        auctionNameElement.style.whiteSpace = 'pre';
                        auctionNameElement.style.display = 'inline-block';
                        
                        // Force the browser to preserve the spaces
                        const style = clonedDoc.createElement('style');
                        style.textContent = `
                            #header-auction-name {
                                white-space: pre !important;
                                display: inline-block !important;
                            }
                        `;
                        clonedDoc.head.appendChild(style);
                    }
                }
            });

            const data = canvas.toDataURL("image/png", 1);
            
            // Add new page for subsequent rows
            if (rowIndex > 0) {
                pdf.addPage();
            }
            
            const imgProperties = pdf.getImageProperties(data);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            // Calculate the best fit for the image within the PDF page
            const imgAspectRatio = imgProperties.width / imgProperties.height;
            const pdfAspectRatio = pdfWidth / pdfHeight;
            
            let finalWidth, finalHeight;
            
            if (imgAspectRatio > pdfAspectRatio) {
                // Image is wider than PDF page - fit to width
                finalWidth = pdfWidth;
                finalHeight = pdfWidth / imgAspectRatio;
            } else {
                // Image is taller than PDF page - fit to height
                finalHeight = pdfHeight;
                finalWidth = pdfHeight * imgAspectRatio;
            }
            
            // Center the image on the page
            const xOffset = (pdfWidth - finalWidth) / 2;
            const yOffset = (pdfHeight - finalHeight) / 2;

            // Add image with proper fitting
            pdf.addImage(data, "PNG", xOffset, yOffset, finalWidth, finalHeight, undefined, 'MEDIUM');
            
            
        } finally {
            // Clean up temporary container
            document.body.removeChild(tempContainer);
        }
    }
    
    // Save with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    pdf.save(`${filename}_${timestamp}.pdf`);
    
};
