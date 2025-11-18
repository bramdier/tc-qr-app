import { Injectable } from '@angular/core';

export interface AssetPayload {
    codeGa: string;
    assetName: string;
    specification: string;
    colour: string;
    date: string;
    user: string;
    location: string;
    emailOfficeActivation: string;
    codeNumber: string; // 12-digit string
}

@Injectable({ providedIn: 'root' })
export class StickerQrService {
    buildPayload(p: AssetPayload): string {
        const codeGa = p.codeGa?.trim() || '';
        const assetName = p.assetName?.trim() || '';
        const specification = p.specification?.trim() || '';
        const colour = p.colour?.trim() || '';
        const date = p.date?.trim() || '';
        const user = p.user?.trim() || '';
        const location = p.location?.trim() || '';
        const email = p.emailOfficeActivation?.trim() || '';
        const codeNumber = p.codeNumber?.trim() || '';

        return (
            `${codeGa}

${assetName}

Spesification : ${specification}

Colour :
${colour}

Years :
${date}

User :
${user}

Location :
${location}

E-Mail Office Activation :
${email}

Code Number :
${codeNumber}`
        );
    }


    downloadCanvasPng(canvas: HTMLCanvasElement, filename: string) {
        const url = canvas.toDataURL('image/png');
        this.downloadDataUrl(url, filename.endsWith('.png') ? filename : `${filename}.png`);
    }

    downloadDataUrl(dataUrl: string, filename: string) {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        a.click();
        a.remove();
    }

    composeStickerPng(
        qrCanvas: HTMLCanvasElement,
        codeNumber: string,
        opts?: { width?: number; height?: number; headerText?: string }
    ): HTMLCanvasElement {
        const width = opts?.width ?? 600;
        const height = opts?.height ?? 840;
        const headerText = opts?.headerText ?? 'PROPERTY OF\nTRANS CONTINENT';

        const headerH = Math.round(height * 0.30);
        const footerH = Math.round(height * 0.06);
        const bodyH = height - headerH;

        const out = document.createElement('canvas');
        out.width = width;
        out.height = height;
        const g = out.getContext('2d')!;
        g.imageSmoothingEnabled = true;

        const blue = '#0e2267';
        const red = '#fe0000';
        const white = '#FFFFFF';

        // Header biru
        g.fillStyle = blue;
        g.fillRect(0, 0, width, headerH);

        // Garis putih sedikit di bawah area biru
        const whiteLineHeight = 14;
        const whiteLineY = headerH - Math.round(whiteLineHeight * 0.8);
        g.fillStyle = white;
        g.fillRect(0, whiteLineY, width, whiteLineHeight);

        // Background merah mulai setelah garis putih
        const redStartY = whiteLineY + whiteLineHeight;
        g.fillStyle = red;
        g.fillRect(0, redStartY, width, height - redStartY);

        g.fillStyle = white;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.font = `bold ${Math.round(headerH * 0.20)}px Arial`;
        const [line1, line2] = headerText.split('\n');
        g.fillText(line1, width / 2, headerH * 0.32);
        g.fillText(line2, width / 2, headerH * 0.55);

        // Posisi dan ukuran QR
        const qrTargetSize = Math.round(width * 0.65);
        const qrX = Math.round((width - qrTargetSize) / 2);

        // Turunkan QR code sedikit (misal dari 12% → 16% area)
        const qrY = Math.round(headerH + (bodyH - footerH) * 0.16);
        g.drawImage(qrCanvas, qrX, qrY, qrTargetSize, qrTargetSize);

        // Posisi teks kode di bawah QR, juga sedikit diturunkan
        g.fillStyle = white;
        g.textAlign = 'center';
        g.textBaseline = 'alphabetic';
        g.font = `bold ${Math.round(height * 0.055)}px Arial`;

        const codeY = qrY + qrTargetSize + Math.round(height * 0.085); // sebelumnya 0.065
        g.fillText(this.formatCodeNumber(codeNumber), width / 2, codeY);


        return out;
    }

    formatCodeNumber(code: string): string {
        const clean = (code || '').trim();

        if (clean.length === 12) {
            return clean.replace(
                /(.{3})(.{3})(.{2})(.{1})(.{3})/,
                '$1 $2 $3 $4 $5'
            );
        }
        return clean;
    }


}
