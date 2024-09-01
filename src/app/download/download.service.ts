/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Response } from 'express';
import PdfPrinter from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { TDocumentDefinitions, TFontDictionary } from 'pdfmake/interfaces';
import BaseResponse from 'src/utils/response/base.response';
import { ResponseSuccess } from 'src/interface/respone';

@Injectable()
export class DownloadService extends BaseResponse {
  constructor() {
    super();
  }

  private async getFonts(): Promise<TFontDictionary> {
    return {
      Roboto: {
        normal: 'src/utils/fonts/Roboto-Regular.ttf',
        bold: 'src/utils/fonts/Roboto-Medium.ttf',
        italics: 'src/utils/fonts/Roboto-Italic.ttf',
        bolditalics: 'src/utils/fonts/Roboto-MediumItalic.ttf',
      },
    };
  }

  private async getDocDefinition(data: any[]): Promise<TDocumentDefinitions> {
    const tableBody = [
      [
        { text: 'No', style: 'header' },
        { text: 'Name', style: 'header' },
        { text: 'Mon', style: 'header' },
        { text: 'Tue', style: 'header' },
        { text: 'Wed', style: 'header' },
        { text: 'Thu', style: 'header' },
        { text: 'Fri', style: 'header' },
        { text: 'Sat', style: 'header' },
        { text: 'Att %', style: 'header' },
        { text: 'Late %', style: 'header' },
        { text: 'Absent %', style: 'header' },
      ],
      // Dynamically insert rows from the data array
      ...data.map((row, index) => [
        `${index + 1}`,
        row.name,
        row.mon,
        row.tue,
        row.wed,
        row.thu,
        row.fri,
        row.sat,
        `${isNaN(row.attPercent) ? 0 : row.attPercent}%`,
        `${isNaN(row.latePercent) ? 0 : row.latePercent}%`,
        `${isNaN(row.absentPercent) ? 0 : row.absentPercent}%`,
      ]),
    ];

    return {
      pageOrientation: 'landscape',
      content: [
        {
          table: {
            headerRows: 2,
            widths: ['auto', '*', '*', '*', '*', '*', '*', '*', '*', '*', '*'], // Adjusted widths array
            body: tableBody,
          },
        },
      ],
      styles: {
        header: {
          bold: true,
          fontSize: 12,
          color: 'black',
          fillColor: '#E0E0E0',
        },
        tableExample: {
          margin: [5, 5, 5, 5],
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black',
        },
      },
    };
  }

  private generateUniqueFilename(): string {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const formattedTime = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
    return `attendance-report-${formattedDate}-${formattedTime}.pdf`;
  }

  async generateAttendanceReport(response: Response): Promise<ResponseSuccess> {
    const dummyData = [
      {
        name: 'Rizky Alfiansyah',
        mon: 'Att',
        tue: 'Att',
        wed: 'Att',
        thu: 'Att',
        fri: 'Att',
        sat: 'Late',
        attPercent: 80,
        latePercent: 10,
        absentPercent: 10,
      },
      {
        name: 'Rizky Alfiansyah',
        mon: 'Att',
        tue: 'Att',
        wed: 'Att',
        thu: 'Att',
        fri: 'Att',
        sat: 'Late',
        attPercent: 80,
        latePercent: 10,
        absentPercent: 10,
      },
    ];

    const fonts = await this.getFonts();
    const PdfPrinter = require('pdfmake');
    const printer = new PdfPrinter(fonts);

    const docDefinition = await this.getDocDefinition(dummyData);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    // Generate a unique filename
    const uniqueFilename = this.generateUniqueFilename();
    const downloadsPath = path.join(os.homedir(), 'Downloads', uniqueFilename);

    const writeStream = fs.createWriteStream(downloadsPath);

    pdfDoc.pipe(writeStream);

    writeStream.on('finish', () => {
      response.download(downloadsPath, uniqueFilename, (err) => {
        if (err) {
          console.error('Gagal mengirim file:', err);
          response.status(500).send('Gagal mengirim file.');
        } else {
          console.log('File berhasil disimpan dan dikirim.');
        }
      });
    });

    pdfDoc.end();

    return this._success('OK, berhasil download', response);
  }
}
