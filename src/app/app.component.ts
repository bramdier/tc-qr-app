import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode';
import { StickerQrService, AssetPayload } from './sticker-qr.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QRCodeModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  title = 'Asset Sticker QR';

  @ViewChild('qrHost', { static: false }) qrHost?: ElementRef<HTMLDivElement>;

  // ✅ DI via inject() so we can safely use them in field initializers
  private fb = inject(FormBuilder);
  private svc = inject(StickerQrService);

  form = this.fb.group({
    assetName: ['', Validators.required],
    specification: ['', Validators.required],
    colour: ['', Validators.required],
    date: ['', Validators.required],
    user: ['', Validators.required],
    location: ['', Validators.required],
    emailOfficeActivation: ['', [Validators.required, Validators.email]],
    codeNumber: ['', [Validators.required, Validators.pattern(/^\d{12}$/)]],
  });

  qrPayload = this.svc.buildPayload({
    assetName: '',
    specification: '',
    colour: '',
    date: '',
    user: '',
    location: '',
    emailOfficeActivation: '',
    codeNumber: '',
  });

  constructor() {
    this.form.valueChanges.subscribe(v => {
      this.qrPayload = this.svc.buildPayload(v as AssetPayload);
    });
  }

  ngAfterViewInit(): void { }

  downloadQrPng() {
    const canvas = this.findQrCanvas();
    if (!canvas) return;
    const code = this.form.get('codeNumber')?.value || 'qr';
    this.svc.downloadCanvasPng(canvas, `qr-${code}.png`);
  }

  downloadStickerPng() {
    const canvas = this.findQrCanvas();
    if (!canvas) return;
    const code = this.form.get('codeNumber')?.value || 'sticker';
    const sticker = this.svc.composeStickerPng(canvas, code as string, {
      width: 600,
      height: 840,
      headerText: 'PROPERTY OF\nTRANS CONTINENT',
    });
    this.svc.downloadCanvasPng(sticker, `sticker-${code}.png`);
  }

  private findQrCanvas(): HTMLCanvasElement | null {
    const host = this.qrHost?.nativeElement;
    return host ? host.querySelector('canvas') : null;
  }
}
