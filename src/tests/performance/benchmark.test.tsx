import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  measurePerformance,
  measureMemoryUsage,
  measureFrameRate,
  measureNetworkRequest,
  measureLongTasks,
} from '../../utils/test-utils';
import { Table } from '../../components/ui/Table';
import { Chart } from '../../components/ui/Chart';
import { List } from '../../components/ui/List';
import { ImageGallery } from '../../components/ui/ImageGallery';
import { SearchInput } from '../../components/ui/SearchInput';

// Mock data generation
const generateLargeDataset = (size: number) => {
  return Array.from({ length: size }, (_, index) => ({
    id: index,
    name: `Item ${index}`,
    description: `Description for item ${index}`,
    value: Math.random() * 1000,
    date: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    tags: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => `tag-${i}`),
    image: `https://picsum.photos/200/300?random=${index}`,
  }));
};

describe('Performance Benchmarks', () => {
  const largeDataset = generateLargeDataset(1000);
  const mediumDataset = generateLargeDataset(100);

  describe('Table Component', () => {
    it('should render large datasets efficiently', async () => {
      await measurePerformance(
        <Table
          data={largeDataset}
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'description', label: 'Description' },
            { key: 'value', label: 'Value' },
            { key: 'date', label: 'Date' },
          ]}
        />,
        { maxDuration: 100, label: 'Table with 1000 rows' }
      );
    });

    it('should sort large datasets quickly', async () => {
      const { container } = render(
        <Table
          data={largeDataset}
          columns={[
            { key: 'name', label: 'Name', sortable: true },
            { key: 'value', label: 'Value', sortable: true },
          ]}
        />
      );

      await measureLongTasks(1000, 1);

      const nameHeader = container.querySelector('th');
      if (nameHeader) {
        await userEvent.click(nameHeader);
      }
    });
  });

  describe('Chart Component', () => {
    it('should render complex visualizations efficiently', async () => {
      await measurePerformance(
        <Chart
          data={mediumDataset}
          type="line"
          xKey="date"
          yKey="value"
          height={400}
          width={800}
        />,
        { maxDuration: 50, label: 'Line chart with 100 points' }
      );
    });

    it('should handle real-time updates smoothly', async () => {
      const { rerender } = render(
        <Chart data={mediumDataset} type="line" xKey="date" yKey="value" height={400} width={800} />
      );

      await measureFrameRate(1000, 55);

      // Simulate real-time updates
      for (let i = 0; i < 10; i++) {
        const updatedData = [...mediumDataset, ...generateLargeDataset(10)];
        rerender(
          <Chart data={updatedData} type="line" xKey="date" yKey="value" height={400} width={800} />
        );
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    });
  });

  describe('List Component', () => {
    it('should render and scroll smoothly with many items', async () => {
      await measurePerformance(
        <List
          items={largeDataset}
          renderItem={item => (
            <div key={item.id} style={{ padding: '1rem' }}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
          )}
          height={400}
          itemHeight={80}
        />,
        { maxDuration: 50, label: 'Virtualized list with 1000 items' }
      );
    });
  });

  describe('Image Gallery', () => {
    it('should load and display images efficiently', async () => {
      const images = mediumDataset.map(item => ({
        src: item.image,
        alt: item.name,
        width: 200,
        height: 300,
      }));

      await measureMemoryUsage(
        async () => {
          render(<ImageGallery images={images} />);
          await new Promise(resolve => setTimeout(resolve, 2000));
        },
        100 * 1024 * 1024
      ); // 100MB limit
    });

    it('should handle image loading performance', async () => {
      const imageUrl = 'https://picsum.photos/800/600';
      await measureNetworkRequest(imageUrl, 2000);
    });
  });

  describe('Search Performance', () => {
    it('should perform search operations efficiently', async () => {
      const { container } = render(
        <SearchInput data={largeDataset} onSearch={() => {}} placeholder="Search items..." />
      );

      const input = container.querySelector('input');
      if (input) {
        await measureLongTasks(2000, 1);
        await userEvent.type(input, 'test search query');
      }
    });
  });
});
