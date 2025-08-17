export interface ScanDocDataItem {
    text: string;
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}