// --- Errors ---

export declare class SecurePDFError extends Error {
  code: string;
  constructor(message: string, code: string);
}

export declare class ValidationError extends SecurePDFError {
  field: string;
  constructor(message: string, field: string);
}

export declare class EncryptionError extends SecurePDFError {
  constructor(message: string);
}

export declare class BuildError extends SecurePDFError {
  constructor(message: string);
}

export declare class FeatureError extends SecurePDFError {
  feature: string;
  constructor(feature: string, message: string);
}

// --- Options ---

export interface TextOptions {
  fontSize?: number;
  font?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  width?: number;
  lineBreak?: boolean;
  link?: string;
  indent?: number;
}

export interface ImageOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fit?: [number, number];
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'center' | 'bottom';
}

export interface TableOptions {
  fontSize?: number;
  columnWidth?: number;
  headerBackground?: string;
  headerColor?: string;
  cellColor?: string;
  borderColor?: string;
}

export interface WatermarkOptions {
  fontSize?: number;
  color?: string;
  opacity?: number;
  angle?: number;
  font?: string;
}

export type PrintingPermission = 'highResolution' | 'lowResolution' | boolean;

export interface PermissionsConfig {
  printing?: PrintingPermission;
  modifying?: boolean;
  copying?: boolean;
  annotating?: boolean;
  fillingForms?: boolean;
  contentAccessibility?: boolean;
  documentAssembly?: boolean;
}

export interface MetadataConfig {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string | string[];
  creator?: string;
  producer?: string;
  company?: string;
  classification?: string;
}

export interface ForensicConfig {
  userId?: string;
  timestamp?: boolean;
}

export interface QROptions {
  x?: number;
  y?: number;
  size?: number;
}

export interface SecurePDFOptions {
  documentId?: string;
  pageSize?: string;
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
}

export interface SaveResult {
  path: string;
  size: number;
  documentId: string;
  contentHash: string | null;
  trackingId: string | null;
}

export interface BufferResult {
  buffer: Buffer;
  contentHash: string | null;
  trackingId: string | null;
  documentId: string;
}

export interface VerificationResult {
  valid: boolean;
  expected: string;
  actual: string;
  message: string;
}

// --- Main Class ---

export declare class SecurePDF {
  readonly documentId: string;

  constructor(options?: SecurePDFOptions);

  addText(text: string, options?: TextOptions): this;
  addPage(options?: Record<string, unknown>): this;
  addImage(source: string | Buffer, options?: ImageOptions): this;
  addTable(rows: string[][], options?: TableOptions): this;
  setFont(name: string, fontPath: string): this;
  moveDown(lines?: number): this;

  encrypt(password: string): this;
  permissions(config: PermissionsConfig): this;
  metadata(config: MetadataConfig): this;
  watermark(text: string, options?: WatermarkOptions): this;
  expire(date: string | Date): this;
  track(id: string): this;
  forensicWatermark(config?: ForensicConfig): this;
  qrVerify(url: string, options?: QROptions): this;
  tamperDetect(enableOrSalt?: boolean | string): this;

  toBuffer(): Promise<BufferResult>;
  save(filePath: string): Promise<SaveResult>;
}

// --- PDFBuilder ---

export declare class PDFBuilder {
  constructor(config: Record<string, unknown>, contentQueue: unknown[]);
  build(): Promise<{ buffer: Buffer; contentHash: string | null }>;
}

// --- ValidationEngine ---

export declare class ValidationEngine {
  static text(value: string, options?: TextOptions): void;
  static password(value: string): void;
  static permissions(config: PermissionsConfig): void;
  static metadata(config: MetadataConfig): void;
  static expirationDate(value: string | Date): void;
  static trackingId(value: string): void;
  static url(value: string): void;
  static filePath(value: string): void;
  static imageSource(value: string | Buffer): void;
  static tableData(rows: unknown[][]): void;
  static watermark(text: string): void;
  static forensicConfig(config: ForensicConfig): void;
}

// --- Feature Exports ---

export declare function applyEncryption(
  docOptions: Record<string, unknown>,
  password: string,
  permissionFlags?: Record<string, unknown>,
): Record<string, unknown>;

export declare function buildPermissionFlags(
  config?: PermissionsConfig,
): Record<string, unknown>;

export declare function renderWatermark(
  doc: unknown,
  text: string,
  options?: WatermarkOptions,
): void;

export declare function applyMetadata(doc: unknown, config?: MetadataConfig): void;
export declare function serializeMetadata(config?: MetadataConfig): string;

export declare function applyExpiration(doc: unknown, date: string | Date): void;

export declare function embedTracking(doc: unknown, trackingId: string): void;
export declare function renderTrackingLayer(doc: unknown, trackingId: string): void;

export declare function renderForensicWatermark(
  doc: unknown,
  config?: ForensicConfig,
): void;

export declare function renderQRVerification(
  doc: unknown,
  baseUrl: string,
  options?: QROptions,
): Promise<void>;

export declare function computeContentHash(
  textParts: string[],
  salt?: string,
): string;
export declare function embedContentHash(doc: unknown, hash: string): void;
export declare function renderIntegritySeal(doc: unknown, hash: string): void;
export declare function verifyContentHash(
  expected: string,
  contentParts: string[],
  salt?: string,
): VerificationResult;

// --- Crypto Utilities ---

export declare function sha256(data: string): string;
export declare function sha256Multi(parts: string[], salt?: string): string;
export declare function hmacSha256(key: string, data: string): string;
export declare function generateDocumentId(): string;
