'use client';

import { useState, useEffect } from 'react';

export default function TestPage() {
  const [data, setData] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Starting to fetch CSV data...');
    fetch('/mario-kart-data.csv')
      .then(response => {
        console.log('CSV fetch response:', response.status);
        return response.text();
      })
      .then(csvContent => {
        console.log('CSV content length:', csvContent.length);
        setData(csvContent.substring(0, 500)); // 只顯示前500字符
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading CSV:', error);
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">CSV Test Page</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {data}
      </pre>
    </div>
  );
}
