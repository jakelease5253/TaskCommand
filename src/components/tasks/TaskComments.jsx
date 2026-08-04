import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

/**
 * TaskComments - Display and manage comments for a task
 */
export default function TaskComments({ task }) {
  const { accessToken } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  // Fetch comments when component mounts (needs the token - the comments
  // API requires an authenticated user for reads as well as writes)
  useEffect(() => {
    if (task?.id && task?.planId && accessToken) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task?.id, task?.planId, accessToken]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7071';
      const response = await fetch(
        `${backendUrl}/api/tasks/${task.id}/comments?planId=${task.planId}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch comments: ${response.statusText}`);
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async (e) => {
    // CRITICAL: Prevent default form submission
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    console.log('handlePostComment called');

    if (!newComment.trim()) {
      console.log('Empty comment, returning');
      return;
    }

    try {
      console.log('Setting posting state...');
      setPosting(true);
      setError(null);
      setSuccess(null);

      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:7071';
      const url = `${backendUrl}/api/tasks/${task.id}/comments?planId=${task.planId}`;
      console.log('Posting to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ comment: newComment })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to post comment';
        try {
          const errorData = await response.json();
          console.log('Error data:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;

          // Add helpful context for permission errors
          if (response.status === 403 || errorMessage.toLowerCase().includes('access') || errorMessage.toLowerCase().includes('denied')) {
            errorMessage = 'Permission denied. Write access to comments may still be propagating (can take up to 1 hour after adding permissions).';
          }
        } catch (parseErr) {
          console.error('Error parsing error response:', parseErr);
          // If we can't parse the error response, use status text
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }

        console.log('Setting error message:', errorMessage);
        setError(errorMessage);
        setPosting(false);
        return; // Don't throw, just return
      }

      // Clear input and refresh comments
      console.log('Success! Clearing input and refreshing...');
      setNewComment('');
      await fetchComments();

      // Show success message
      setSuccess('Comment posted successfully!');
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Caught error in handlePostComment:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      console.log('Finally block - setting posting to false');
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
        Loading comments...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Poppins' }}>
      {/* Header */}
      <div style={{
        fontSize: '14px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#1e293b'
      }}>
        Comments ({comments.length})
      </div>

      {/* Success message */}
      {success && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '10px 12px',
          marginBottom: '12px',
          backgroundColor: '#d1fae5',
          border: '1px solid #86efac',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#065f46',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>✓</span>
            <span style={{ lineHeight: '1.5' }}>{success}</span>
          </div>
          <button
            onClick={() => setSuccess(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#065f46',
              cursor: 'pointer',
              padding: '0',
              fontSize: '18px',
              lineHeight: '1',
              flexShrink: 0
            }}
            aria-label="Dismiss success"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '10px 12px',
          marginBottom: '12px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#991b1b',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
            <span style={{ lineHeight: '1.5' }}>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#991b1b',
              cursor: 'pointer',
              padding: '0',
              fontSize: '18px',
              lineHeight: '1',
              flexShrink: 0
            }}
            aria-label="Dismiss error"
            title="Dismiss"
          >
            ×
          </button>
        </div>
      )}

      {/* Comment list */}
      <div style={{
        maxHeight: '300px',
        overflowY: 'auto',
        marginBottom: '16px'
      }}>
        {comments.length === 0 ? (
          <div style={{
            padding: '24px',
            textAlign: 'center',
            color: '#94a3b8',
            fontSize: '13px'
          }}>
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              style={{
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              {/* Comment header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#475569'
                }}>
                  {comment.author}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8'
                }}>
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </div>
              </div>

              {/* Comment content */}
              <div style={{
                fontSize: '13px',
                color: '#1e293b',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}>
                {comment.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New comment input */}
      <div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          disabled={posting}
          onKeyDown={(e) => {
            // Allow Cmd+Enter or Ctrl+Enter to submit
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              handlePostComment(e);
            }
          }}
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '10px 12px',
            fontSize: '13px',
            fontFamily: 'Poppins',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s',
            marginBottom: '8px'
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--theme-primary)'}
          onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
        />

        <div style={{
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            type="button"
            onClick={handlePostComment}
            disabled={!newComment.trim() || posting}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: '500',
              fontFamily: 'Poppins',
              color: 'white',
              backgroundColor: newComment.trim() && !posting ? 'var(--theme-primary)' : '#cbd5e1',
              border: 'none',
              borderRadius: '6px',
              cursor: newComment.trim() && !posting ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (newComment.trim() && !posting) {
                e.target.style.backgroundColor = 'var(--theme-primary-dark)';
              }
            }}
            onMouseOut={(e) => {
              if (newComment.trim() && !posting) {
                e.target.style.backgroundColor = 'var(--theme-primary)';
              }
            }}
          >
            {posting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>
    </div>
  );
}
