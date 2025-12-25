import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface ImageCropModalProps {
    open: boolean;
    onClose: () => void;
    imageSrc: string;
    onCropComplete: (croppedBlob: Blob) => void;
}

function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

export function ImageCropModal({ open, onClose, imageSrc, onCropComplete }: ImageCropModalProps) {
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [scale, setScale] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        setCrop(centerAspectCrop(width, height, 1));
    }, []);

    const getCroppedImg = useCallback(async (): Promise<Blob | null> => {
        const image = imgRef.current;
        if (!image || !completedCrop) return null;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Tamanho final do avatar (300x300 é bom para qualidade)
        const outputSize = 300;
        canvas.width = outputSize;
        canvas.height = outputSize;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Calcular as coordenadas do crop considerando a escala
        const cropX = completedCrop.x * scaleX;
        const cropY = completedCrop.y * scaleY;
        const cropWidth = completedCrop.width * scaleX;
        const cropHeight = completedCrop.height * scaleY;

        ctx.drawImage(
            image,
            cropX,
            cropY,
            cropWidth,
            cropHeight,
            0,
            0,
            outputSize,
            outputSize,
        );

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    resolve(blob);
                },
                'image/jpeg',
                0.9,
            );
        });
    }, [completedCrop]);

    const handleSave = async () => {
        setIsProcessing(true);
        try {
            const croppedBlob = await getCroppedImg();
            if (croppedBlob) {
                onCropComplete(croppedBlob);
            }
        } catch (error) {
            console.error('Error cropping image:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setScale(1);
        if (imgRef.current) {
            const { width, height } = imgRef.current;
            setCrop(centerAspectCrop(width, height, 1));
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Ajustar Foto de Perfil</DialogTitle>
                    <DialogDescription>
                        Arraste para posicionar e redimensione para ajustar sua foto
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Área de Crop */}
                    <div className="flex justify-center bg-muted rounded-lg p-2 sm:p-4 max-h-[50vh] sm:max-h-[400px] overflow-auto">
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop
                            className="max-w-full"
                        >
                            <img
                                ref={imgRef}
                                src={imageSrc}
                                alt="Crop preview"
                                style={{ transform: `scale(${scale})`, maxHeight: '45vh' }}
                                onLoad={onImageLoad}
                                className="max-w-full"
                            />
                        </ReactCrop>
                    </div>

                    {/* Controles de Zoom */}
                    <div className="flex items-center gap-4">
                        <ZoomOut className="h-4 w-4 text-muted-foreground" />
                        <Slider
                            value={[scale]}
                            onValueChange={([value]) => setScale(value)}
                            min={0.5}
                            max={2}
                            step={0.1}
                            className="flex-1"
                        />
                        <ZoomIn className="h-4 w-4 text-muted-foreground" />
                        <Button variant="outline" size="icon" onClick={handleReset}>
                            <RotateCcw className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isProcessing} className="w-full sm:w-auto">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} disabled={isProcessing || !completedCrop} className="w-full sm:w-auto">
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processando...
                            </>
                        ) : (
                            'Salvar Foto'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
