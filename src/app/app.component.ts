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

const TEMPLATE_KEYS: (keyof AssetPayload)[] = [
  'codeGa',
  'assetName',
  'specification',
  'colour',
  'date',
  'user',
  'location',
  'emailOfficeActivation',
  'codeNumber',
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, QRCodeModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  title = 'Trans Continent Asset QR';

  @ViewChild('qrHost', { static: false }) qrHost?: ElementRef<HTMLDivElement>;
  @ViewChild('fileInput', { static: false }) fileInput?: ElementRef<HTMLInputElement>;

  private fb = inject(FormBuilder);
  private svc = inject(StickerQrService);

  uploadError: string | null = null;

  form = this.fb.group({
    codeGa: ['', Validators.required],
    assetName: ['', Validators.required],
    specification: ['', Validators.required],
    colour: ['', Validators.required],
    date: ['', Validators.required],
    user: ['', Validators.required],
    location: ['', Validators.required],
    emailOfficeActivation: ['', Validators.email],
    codeNumber: ['', [Validators.required, Validators.pattern(/^.{12}$/)]],
  });

  qrPayload = this.svc.buildPayload({
    codeGa: '',
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

  // ── Template download ──────────────────────────────────────────────────────

  downloadTemplate() {
    const template: Partial<AssetPayload> = {};
    for (const key of TEMPLATE_KEYS) {
      template[key] = '';
    }
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'asset-template.json';
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // ── Template upload ────────────────────────────────────────────────────────

  triggerUpload() {
    this.uploadError = null;
    this.fileInput?.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // reset so same file can be re-uploaded

    if (!file) return;

    if (!file.name.endsWith('.json')) {
      this.uploadError = 'Please select a .json file.';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);

        if (typeof data !== 'object' || data === null || Array.isArray(data)) {
          this.uploadError = 'Invalid template: expected a JSON object.';
          return;
        }

        // Only patch keys that exist in the form and have a non-empty value in the file
        const patch: Partial<AssetPayload> = {};
        for (const key of TEMPLATE_KEYS) {
          if (key in data && data[key] !== undefined && data[key] !== null) {
            patch[key] = String(data[key]);
          }
        }

        this.form.patchValue(patch);
        this.form.markAllAsTouched();
        this.uploadError = null;
      } catch {
        this.uploadError = 'Could not parse file. Make sure it is valid JSON.';
      }
    };
    reader.readAsText(file);
  }

  // ── Downloads ──────────────────────────────────────────────────────────────

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

    const sticker = this.svc.composeStickerPng(canvas, code, {
      width: 295,
      height: 413,
      headerText: 'PROPERTY OF\nTRANS CONTINENT'
    });

    this.svc.downloadCanvasPng(sticker, `sticker-${code}.png`);
  }

  private findQrCanvas(): HTMLCanvasElement | null {
    const host = this.qrHost?.nativeElement;
    return host ? host.querySelector('canvas') : null;
  }
}
