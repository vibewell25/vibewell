import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { getSkinAnalysisHistory } from '../src/services/skinAnalysisService';
import { SkinAnalysisProgress } from '../src/services/skinAnalysisService';

export default function SkinAnalysisHistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<SkinAnalysisProgress[]>([]);

  useEffect(() => {
    loadHistory();
[]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getSkinAnalysisHistory();
      setHistory(data);
catch (error) {
      console.error('Error loading skin analysis history:', error);
      alert('Failed to load history. Please try again.');
finally {
      setLoading(false);
const handleSelectAnalysis = (id: string) => {
    router.push({
      pathname: '/skin-analysis-detail',
      params: { id }
const renderItem = ({ item }: { item: SkinAnalysisProgress }) => {
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
// Calculate score color
    let scoreColor = '#F44336'; // Red for poor
    if (item.score > 70) {
      scoreColor = '#4CAF50'; // Green for good
else if (item.score > 40) {
      scoreColor = '#FFC107'; // Yellow for medium
return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => handleSelectAnalysis(item.id)}
      >
        <View style={styles.historyItemMain}>
          <View>
            <Text style={styles.historyItemDate}>{formattedDate}</Text>
            <Text style={styles.historyItemTime}>
              {date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
)}
            </Text>
          </View>
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreText, { color: scoreColor }]}>
              {item.score}
            </Text>
          </View>
        </View>

        <Text style={styles.historyItemDetails}>
          {item.primaryCondition}
          {item.improvementFromLast !== 0 && (
            <Text style={[
              styles.improvementText,
              item.improvementFromLast > 0 ? styles.improved : styles.declined
            ]}>
              {' '}
              {item.improvementFromLast > 0 ? '+' : ''}
              {item.improvementFromLast}%
            </Text>
          )}
        </Text>
      </TouchableOpacity>
return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Analysis History',
          headerStyle: {
            backgroundColor: '#f4f4f8',
headerTintColor: '#6200ee',
/>
      
      <View style={styles.header}>
        <Text style={styles.title}>Skin Analysis History</Text>
        <Text style={styles.subtitle}>
          Review your skin health progress over time
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : history.length > 0 ? (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadHistory}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            You haven't performed any skin analysis yet.
          </Text>
          <TouchableOpacity
            style={styles.newAnalysisButton}
            onPress={() => router.push('/skin-analysis')}
          >
            <Text style={styles.newAnalysisButtonText}>
              Perform Your First Analysis
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f8',
header: {
    padding: 20,
    backgroundColor: '#f4f4f8',
title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
listContent: {
    padding: 16,
historyItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
historyItemMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
historyItemDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
historyItemTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
scoreCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
historyItemDetails: {
    fontSize: 14,
    color: '#666',
improvementText: {
    fontSize: 14,
    fontWeight: 'bold',
improved: {
    color: '#4CAF50',
declined: {
    color: '#F44336',
loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
newAnalysisButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
newAnalysisButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
