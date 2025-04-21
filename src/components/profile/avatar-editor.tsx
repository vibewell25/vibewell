import { useState, useRef } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface AvatarEditorProps {
  image: File;
  onSave: (croppedImage: Blob) => void;
  onCancel: () => void;
  isOpen: boolean;
}

export function AvatarEditorDialog({ image, onSave, onCancel, isOpen }: AvatarEditorProps) {
  const [scale, setScale] = useState(1);
  const editorRef = useRef<AvatarEditor>(null);

  const handleSave = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      canvas.toBlob(
        (blob: Blob | null) => {
          if (blob) {
            onSave(blob);
          }
        },
        'image/jpeg',
        0.95
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile Picture</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <AvatarEditor
            ref={editorRef}
            image={image}
            width={250}
            height={250}
            border={50}
            borderRadius={125}
            color={[255, 255, 255, 0.6]}
            scale={scale}
            rotate={0}
          />
          <div className="w-full px-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Zoom</span>
              <Slider
                value={[scale]}
                onValueChange={([value]) => setScale(value)}
                min={1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
