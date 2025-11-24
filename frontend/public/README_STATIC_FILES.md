# Static Files for Summarizer

This folder should contain the following static files for the Summarizer to work:

## Required Files:

1. **1.pdf** - A PDF file that will be used for summarization
2. **2.png** - An image file that will be used for summarization
3. **flowchart-pdf.png** - Flowchart image for the PDF document
4. **flowchart-image.png** - Flowchart image for the image document

## How to Add Files:

1. Place your `1.pdf` file in the `frontend/public/` folder
2. Place your `2.png` file in the `frontend/public/` folder
3. Place your flowchart images in the `frontend/public/` folder

The Summarizer component will automatically load these files and display:
- File previews
- Summaries for each file
- Flowchart images
- JSON question data

## Note:

If the files are not found, placeholder images will be shown. Make sure the file names match exactly:
- `1.pdf`
- `2.png`
- `flowchart-pdf.png`
- `flowchart-image.png`



