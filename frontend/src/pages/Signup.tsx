import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonToast,
  IonLoading,
  IonText
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { supabase } from '../supabaseClient';

/**
 * Signup Page Component
 * 
 * Provides a React component using Ionic components to handle new user registration.
 * Connects with Supabase authentication using the signUp method.
 */
const Signup: React.FC = () => {
  const history = useHistory();

  // State variables for form fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // UI State management
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  /**
   * Triggers the registration process with Supabase Auth
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Input Validations
    if (!email.trim() || !password.trim()) {
      setToastMessage('Please fill in all fields.');
      setShowToast(true);
      return;
    }

    if (password !== confirmPassword) {
      setToastMessage('Passwords do not match.');
      setShowToast(true);
      return;
    }

    if (password.length < 6) {
      setToastMessage('Password must be at least 6 characters.');
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      // Sign up using supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check if session is auto-established
      const session = data?.session;
      
      if (session) {
        setToastMessage('Signup successful! Welcome to your Dashboard.');
        setShowToast(true);
        // Clear fields
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          history.push('/dashboard');
        }, 1000);
      } else {
        // If email verification is active on Supabase, the user needs to confirm first
        setToastMessage('Signup successful! Please check your email to confirm your account.');
        setShowToast(true);
        // Clear fields
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // Redirect back to login
        setTimeout(() => {
          history.push('/login');
        }, 3000);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during signup.';
      setToastMessage(errorMessage);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Create Account</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100%',
        }}>
          <IonCard style={{ maxWidth: '400px', width: '100%' }}>
            <IonCardHeader>
              <IonCardTitle>Sign Up</IonCardTitle>
              <IonCardSubtitle>Join us to start managing your tasks</IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
              <form onSubmit={handleSignup}>
                {/* Email Input */}
                <IonItem className="ion-margin-bottom">
                  <IonInput
                    label="Email"
                    labelPlacement="floating"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onIonInput={(e) => setEmail(e.detail.value!)}
                    required
                  />
                </IonItem>

                {/* Password Input */}
                <IonItem className="ion-margin-bottom">
                  <IonInput
                    label="Password"
                    labelPlacement="floating"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onIonInput={(e) => setPassword(e.detail.value!)}
                    required
                  />
                </IonItem>

                {/* Confirm Password Input */}
                <IonItem className="ion-margin-bottom">
                  <IonInput
                    label="Confirm Password"
                    labelPlacement="floating"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                    required
                  />
                </IonItem>

                {/* Submit Button */}
                <IonButton expand="block" type="submit" className="ion-margin-top">
                  Sign Up
                </IonButton>
              </form>

              {/* Navigation back to Login */}
              <div className="ion-text-center ion-margin-top">
                <IonText color="medium">
                  Already have an account?{' '}
                </IonText>
                <IonButton fill="clear" size="small" routerLink="/login">
                  Login
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Loading Spinner */}
        <IonLoading isOpen={loading} message="Creating account..." />

        {/* Success/Error Toast */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          buttons={[{ text: 'Dismiss', role: 'cancel' }]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Signup;
