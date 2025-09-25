import { Injectable } from '@angular/core';

export interface AssetPayload {
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
        const ordered: AssetPayload = {
            assetName: p.assetName?.trim(),
            specification: p.specification?.trim(),
            colour: p.colour?.trim(),
            date: p.date?.trim(),
            user: p.user?.trim(),
            location: p.location?.trim(),
            emailOfficeActivation: p.emailOfficeActivation?.trim(),
            codeNumber: p.codeNumber?.trim(),
        };
        return JSON.stringify(ordered);
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

        const headerH = Math.round(height * 0.18);
        const footerH = Math.round(height * 0.06);
        const bodyH = height - headerH;

        const out = document.createElement('canvas');
        out.width = width;
        out.height = height;
        const g = out.getContext('2d')!;
        g.imageSmoothingEnabled = true;

        const blue = '#0B2A5B';
        const red = '#E02222';
        const white = '#FFFFFF';

        g.fillStyle = red;
        g.fillRect(0, headerH, width, bodyH);

        g.fillStyle = blue;
        g.fillRect(0, 0, width, headerH);

        g.fillStyle = white;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.font = `bold ${Math.round(headerH * 0.28)}px Arial`;
        const [line1, line2] = headerText.split('\n');
        g.fillText(line1, width / 2, headerH * 0.40);
        g.fillText(line2, width / 2, headerH * 0.78);

        const qrTargetSize = Math.round(width * 0.65);
        const qrX = Math.round((width - qrTargetSize) / 2);
        const qrY = Math.round(headerH + (bodyH - footerH) * 0.12);
        g.drawImage(qrCanvas, qrX, qrY, qrTargetSize, qrTargetSize);

        g.fillStyle = white;
        g.textAlign = 'center';
        g.textBaseline = 'alphabetic';
        g.font = `bold ${Math.round(height * 0.055)}px Arial`;
        const codeY = qrY + qrTargetSize + Math.round(height * 0.065);
        g.fillText(this.formatCodeNumber(codeNumber), width / 2, codeY);

        return out;
    }

    formatCodeNumber(code: string): string {
        const clean = (code || '').trim();
        if (/^\d{12}$/.test(clean)) {
            return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
        }
        return clean;
    }
}
