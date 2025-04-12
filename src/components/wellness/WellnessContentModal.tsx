import { Icons } from '@/components/icons';
import { WellnessContentEditor } from './WellnessContentEditor';
import { ContentType } from './ContentTypeSelector';
interface WellnessContent {
  id?: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  level: string;
  contentType: ContentType;
  content: string;
  tags?: string[];
  videoUrl?: string;
  image?: string;
}
interface WellnessContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: WellnessContent) => void;
  content?: WellnessContent;
}
export function WellnessContentModal({ 
  isOpen, 
  onClose, 
  onSave,
  content 
}: WellnessContentModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {content ? 'Edit Content' : 'Create New Content'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icons.XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <WellnessContentEditor
          content={content}
          onSave={onSave}
          onCancel={onClose}
        />
      </div>
    </div>
  );
} 