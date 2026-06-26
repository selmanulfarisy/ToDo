import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardContent,
  IonLoading,
  IonToast,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonInput,
  IonIcon,
  IonBadge,
  IonText,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { trashOutline, addOutline, logOutOutline, listOutline } from 'ionicons/icons';
import { supabase } from '../supabaseClient';

/**
 * Todo Type Definition
 */
interface Todo {
  id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  created_at: string;
}

/**
 * Dashboard Page Component
 * 
 * Secure landing page showing user's ToDo items.
 * Performs database CRUD operations directly via Supabase client.
 */
const Dashboard: React.FC = () => {
  const history = useHistory();

  // Authentication State
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Data State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState<string>('');

  // UI/Loading States
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [fetchingTodos, setFetchingTodos] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // 1. Session checking and loading todos
  useEffect(() => {
    const checkUserAndFetch = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          setToastMessage('Session expired or invalid. Please login again.');
          setShowToast(true);
          setTimeout(() => {
            history.push('/login');
          }, 1500);
          return;
        }

        const user = session.user;
        setUserId(user.id);
        setUserEmail(user.email ?? 'User');
        setCheckingAuth(false);

        // Fetch todos for this user
        await loadTodos(user.id);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Auth verification failed.';
        setToastMessage(msg);
        setShowToast(true);
        history.push('/login');
      }
    };

    checkUserAndFetch();
  }, [history]);

  /**
   * Fetches todos from Supabase table
   */
  const loadTodos = async (currentUserId: string) => {
    setFetchingTodos(true);
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTodos(data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve todos.';
      setToastMessage(msg);
      setShowToast(true);
    } finally {
      setFetchingTodos(false);
    }
  };

  /**
   * Creates a new todo item in Supabase
   */
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTodoTitle.trim()) {
      setToastMessage('Task title cannot be empty.');
      setShowToast(true);
      return;
    }

    if (!userId) return;

    setActionLoading(true);
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            title: newTodoTitle.trim(),
            user_id: userId,
            is_completed: false
          }
        ])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        // Prepend the new todo to the list
        setTodos([data[0], ...todos]);
        setNewTodoTitle('');
        setToastMessage('Task added successfully.');
        setShowToast(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add task.';
      setToastMessage(msg);
      setShowToast(true);
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Updates/Toggles completion status in Supabase
   */
  const handleToggleTodo = async (todo: Todo) => {
    const updatedStatus = !todo.is_completed;
    
    // Optimistic UI Update for a snappy experience
    const originalTodos = [...todos];
    setTodos(
      todos.map((t) => (t.id === todo.id ? { ...t, is_completed: updatedStatus } : t))
    );

    try {
      const { error } = await supabase
        .from('todos')
        .update({ is_completed: updatedStatus })
        .eq('id', todo.id);

      if (error) throw error;
    } catch (err: unknown) {
      // Revert UI if query fails
      setTodos(originalTodos);
      const msg = err instanceof Error ? err.message : 'Failed to update task.';
      setToastMessage(msg);
      setShowToast(true);
    }
  };

  /**
   * Deletes a todo item from Supabase
   */
  const handleDeleteTodo = async (todoId: string) => {
    // Optimistic UI Update
    const originalTodos = [...todos];
    setTodos(todos.filter((t) => t.id !== todoId));

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);

      if (error) throw error;
      setToastMessage('Task deleted.');
      setShowToast(true);
    } catch (err: unknown) {
      // Revert UI if query fails
      setTodos(originalTodos);
      const msg = err instanceof Error ? err.message : 'Failed to delete task.';
      setToastMessage(msg);
      setShowToast(true);
    }
  };

  /**
   * Triggers logout via Supabase Auth
   */
  const handleLogout = async () => {
    setActionLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setActionLoading(false);
      history.push('/login');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Logout failed.';
      setToastMessage(msg);
      setShowToast(true);
      setActionLoading(false);
    }
  };

  // Grouping todos for cleaner separation in UI
  const activeTodos = todos.filter((todo) => !todo.is_completed);
  const completedTodos = todos.filter((todo) => todo.is_completed);

  return (
    <IonPage>
      {/* App Bar / Toolbar */}
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle style={{ display: 'flex', alignItems: 'center' }}>
            <IonIcon icon={listOutline} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Todo Dashboard
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout} title="Log Out">
              <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" fullscreen>
        {checkingAuth ? (
          <IonLoading isOpen={checkingAuth} message="Authenticating session..." />
        ) : (
          <IonGrid style={{ maxWidth: '600px', margin: '0 auto', padding: '0' }}>
            <IonRow>
              <IonCol>
                {/* Header Profile Summary */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 6px' }}>
                  <div>
                    <h5 style={{ margin: '0', fontWeight: 'bold' }}>Tasks</h5>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--ion-color-medium)' }}>
                      Logged in as: {userEmail}
                    </p>
                  </div>
                  <IonBadge color="secondary" style={{ fontSize: '0.9rem', padding: '6px 12px', borderRadius: '12px' }}>
                    {activeTodos.length} Active
                  </IonBadge>
                </div>

                {/* Create Task Card */}
                <IonCard style={{ margin: '0 0 16px 0', border: '1px solid var(--ion-color-light)' }}>
                  <IonCardContent style={{ padding: '12px' }}>
                    <form onSubmit={handleAddTodo} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IonItem lines="none" style={{ flexGrow: 1, '--background': 'transparent', border: '1px solid var(--ion-color-light)', borderRadius: '8px' }}>
                        <IonInput
                          placeholder="What needs to be done?"
                          value={newTodoTitle}
                          onIonInput={(e) => setNewTodoTitle(e.detail.value!)}
                          disabled={actionLoading}
                          style={{ margin: '0' }}
                        />
                      </IonItem>
                      <IonButton type="submit" disabled={actionLoading || !newTodoTitle.trim()} style={{ height: '48px', margin: '0' }}>
                        <IonIcon icon={addOutline} slot="icon-only" />
                      </IonButton>
                    </form>
                  </IonCardContent>
                </IonCard>

                {/* Fetching Skeleton / Indicator */}
                {fetchingTodos && todos.length === 0 ? (
                  <div className="ion-text-center" style={{ padding: '32px' }}>
                    <IonText color="medium">Loading your tasks...</IonText>
                  </div>
                ) : todos.length === 0 ? (
                  // Empty State Placeholder
                  <div className="ion-text-center" style={{ padding: '64px 32px' }}>
                    <IonIcon icon={listOutline} style={{ fontSize: '4rem', color: 'var(--ion-color-light)' }} />
                    <h3 style={{ marginTop: '16px', fontWeight: '500', color: 'var(--ion-color-step-600)' }}>
                      No tasks yet
                    </h3>
                    <p style={{ color: 'var(--ion-color-medium)', margin: '8px 0 0 0', fontSize: '0.9rem' }}>
                      Add a task above to start tracking your day.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Active Todos List */}
                    {activeTodos.length > 0 && (
                      <IonList style={{ background: 'transparent', padding: '0' }}>
                        <div style={{ margin: '16px 6px 8px 6px', fontSize: '0.85rem', color: 'var(--ion-color-medium)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Active Tasks ({activeTodos.length})
                        </div>
                        {activeTodos.map((todo) => (
                          <IonItem key={todo.id} lines="full" style={{ '--background': 'transparent', borderRadius: '8px', marginBottom: '6px', border: '1px solid var(--ion-color-light)' }}>
                            <IonCheckbox
                              slot="start"
                              checked={todo.is_completed}
                              onIonChange={() => handleToggleTodo(todo)}
                            />
                            <IonLabel style={{ fontSize: '1rem', fontWeight: '500' }}>
                              {todo.title}
                            </IonLabel>
                            <IonButton
                              slot="end"
                              fill="clear"
                              color="danger"
                              onClick={() => handleDeleteTodo(todo.id)}
                            >
                              <IonIcon icon={trashOutline} slot="icon-only" />
                            </IonButton>
                          </IonItem>
                        ))}
                      </IonList>
                    )}

                    {/* Completed Todos List */}
                    {completedTodos.length > 0 && (
                      <IonList style={{ background: 'transparent', padding: '0', marginTop: '24px' }}>
                        <div style={{ margin: '16px 6px 8px 6px', fontSize: '0.85rem', color: 'var(--ion-color-medium)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Completed ({completedTodos.length})
                        </div>
                        {completedTodos.map((todo) => (
                          <IonItem key={todo.id} lines="full" style={{ '--background': 'transparent', borderRadius: '8px', marginBottom: '6px', border: '1px solid var(--ion-color-light)', opacity: 0.6 }}>
                            <IonCheckbox
                              slot="start"
                              checked={todo.is_completed}
                              onIonChange={() => handleToggleTodo(todo)}
                            />
                            <IonLabel style={{ textDecoration: 'line-through', color: 'var(--ion-color-medium)', fontSize: '1rem' }}>
                              {todo.title}
                            </IonLabel>
                            <IonButton
                              slot="end"
                              fill="clear"
                              color="danger"
                              onClick={() => handleDeleteTodo(todo.id)}
                            >
                              <IonIcon icon={trashOutline} slot="icon-only" />
                            </IonButton>
                          </IonItem>
                        ))}
                      </IonList>
                    )}
                  </>
                )}
              </IonCol>
            </IonRow>
          </IonGrid>
        )}

        {/* Global Loading Spinner for updates/signouts */}
        <IonLoading isOpen={actionLoading} message="Updating..." />

        {/* Info/Warning Toast notification */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          buttons={[{ text: 'Dismiss', role: 'cancel' }]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
