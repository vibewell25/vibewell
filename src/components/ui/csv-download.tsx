import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/icons';

interface CSVDownloadProps {
  data: string[][];
  filename: string;
  buttonText: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
}

export function CSVDownload({
  data,
  filename,
  buttonText,
  variant = 'outline',
  size = 'default',
  disabled = false,
}: CSVDownloadProps) {
  const handleDownload = () => {
    // Convert 2D array to CSV string
    const csvContent = data
      .map((row) =>
        row
          .map((cell) => {
            // Escape cells with commas, quotes, or newlines
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(','),
      )
      .join('\n');

    // Create a blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary link and click it to download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={disabled}
      className="flex items-center gap-2"
    >
      <Icons.download className="h-4 w-4" />
      {buttonText}
    </Button>
  );
}
