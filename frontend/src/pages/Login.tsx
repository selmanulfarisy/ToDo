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
 * Login Page Component
 * 
 * Provides a React component using Ionic components to handle user authentication.
 * Connects with Supabase authentication using the signInWithPassword method.
 */
const Login: React.FC = () => {
  const history = useHistory();

  // State variables for form fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // UI State management
  const [loading, setLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);

  /**
   * Triggers the sign-in process with Supabase Auth
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Input Validations
    if (!email.trim() || !password.trim()) {
      setToastMessage('Please enter your email and password.');
      setShowToast(true);
      return;
    }

    setLoading(true);

    try {
      // Authenticate using supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data?.session) {
        setToastMessage('Welcome back!');
        setShowToast(true);
        
        // Clear fields
        setEmail('');
        setPassword('');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          history.push('/dashboard');
        }, 1000);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Incorrect credentials or login failed.';
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
          <IonTitle>Todo App</IonTitle>
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
              <IonCardTitle>Sign In</IonCardTitle>
              <IonCardSubtitle>Access your personal task manager</IonCardSubtitle>
            </IonCardHeader>

            <IonCardContent>
              <form onSubmit={handleLogin}>
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

                {/* Login Button */}
                <IonButton expand="block" type="submit" className="ion-margin-top">
                  Login
                </IonButton>
              </form>

              {/* Navigation to Sign up */}
              <div className="ion-text-center ion-margin-top">
                <IonText color="medium">
                  Don't have an account?{' '}
                </IonText>
                <IonButton fill="clear" size="small" routerLink="/signup">
                  Sign Up
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Loading Spinner */}
        <IonLoading isOpen={loading} message="Logging in..." />

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

export default Login;
