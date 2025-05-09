import { Icons } from '@/components/icons';
('use client');
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { ContentTypeSelector } from '@/components/wellness/ContentTypeSelector';
interface BeautyContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: any) => void;
export function BeautyContentModal({ isOpen, onClose, onSave }: BeautyContentModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('beginner');
  const [contentType, setContentType] = useState('article');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      category,
      duration,
      level,
      contentType,
return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto w-full max-w-2xl rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between border-b p-6">
            <Dialog.Title className="text-xl font-semibold">Create Beauty Content</Dialog.Title>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <Icons.XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="mb-2 block text-sm font-medium">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea w-full"
                  rows={4}
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="mb-2 block text-sm font-medium">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-select w-full"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="hair">Hair</option>
                  <option value="makeup">Makeup</option>
                  <option value="nails">Nails</option>
                  <option value="skincare">Skincare</option>
                  <option value="spa">Spa Treatments</option>
                  <option value="other">Other Services</option>
                </select>
              </div>
              <div>
                <label htmlFor="duration" className="mb-2 block text-sm font-medium">
                  Duration
                </label>
                <input
                  type="text"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="form-input w-full"
                  placeholder="e.g., 30 mins"
                  required
                />
              </div>
              <div>
                <label htmlFor="level" className="mb-2 block text-sm font-medium">
                  Level
                </label>
                <select
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="form-select w-full"
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Content Type</label>
                <ContentTypeSelector selectedType={contentType} onSelectType={setContentType} />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button type="button" onClick={onClose} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Create Content
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
