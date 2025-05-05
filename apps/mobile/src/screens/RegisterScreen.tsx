import React from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const RegisterScreen: React.FC = () => {
  const { isLoading, signIn } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      {isLoading ? (
        <ActivityIndicator size="large" color="#2A9D8F" />
      ) : (
        <Button title="Sign Up with Auth0" onPress={() => signIn(true)} color="#2A9D8F" />
      )}
    </View>
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#2A9D8F',
export default RegisterScreen;
