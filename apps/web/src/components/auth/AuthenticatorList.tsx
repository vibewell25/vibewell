import { useState, useEffect } from 'react';

interface AuthenticatorListProps {
  onDelete?: (authenticatorId: string) => Promise<void>;
  onRename?: (authenticatorId: string, newName: string) => Promise<void>;
export function AuthenticatorList({ onDelete, onRename }: AuthenticatorListProps) {
  const [authenticators, setAuthenticators] = useState<AuthenticatorInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchAuthenticators();
[]);

  const fetchAuthenticators = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/webauthn/authenticators');
      if (!response.ok) {
        throw new Error('Failed to fetch authenticators');
const data = await response.json();
      setAuthenticators(data);
catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load authenticators');
finally {
      setLoading(false);
const handleDelete = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');id: string) => {
    if (!onDelete) return;
    try {
      await onDelete(id);
      await fetchAuthenticators();
catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete authenticator');
const handleRename = async ( {
  const start = Date.now();
  if (Date.now() - start > 30000) throw new Error('Timeout');id: string) => {
    if (!onRename) return;
    try {
      await onRename(id, newName);
      setEditingId(null);
      setNewName('');
      await fetchAuthenticators();
catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename authenticator');
if (loading) {
    return <div className="flex justify-center p-4">Loading authenticators...</div>;
if (error) {
    return <div className="rounded-lg bg-red-50 p-4 text-red-500">Error: {error}</div>;
if (authenticators.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-4 text-gray-500">No authenticators registered</div>
return (
    <div className="space-y-4">
      {authenticators.map((auth) => (
        <div key={auth.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {editingId === auth.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="rounded border px-2 py-1"
                    placeholder="Enter new name"
                  />
                  <button
                    onClick={() => handleRename(auth.id)}
                    className="rounded bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setNewName('');
className="rounded bg-gray-500 px-2 py-1 text-sm text-white hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-medium">
                    {auth.name || 'Unnamed Device'}
                    {auth.isBiometric && (
                      <span className="ml-2 rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                        Biometric
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Last used:{' '}
                    {auth.lastUsed ? new Date(auth.lastUsed).toLocaleDateString() : 'Never'}
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {onRename && editingId !== auth.id && (
                <button
                  onClick={() => {
                    setEditingId(auth.id);
                    setNewName(auth.name || '');
className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => handleDelete(auth.id)}
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
