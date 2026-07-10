'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { getAvatar } from "@/lib/avatar";
import { XP_REWARDS } from "@/data/xpSystem";
import { dialects } from "@/data/staticData";

const AppContext = createContext(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

let toastId = 0;

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [dailyCompleted, setDailyCompleted] = useState(false);
  const [progress, setProgress] = useState({});
  const [knownCards, setKnownCards] = useState({});
  const [selectedDialect, setSelectedDialect] = useState(null);
  const [apiWords, setApiWords] = useState([]);
  const [authError, setAuthError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [pendingGoogle, setPendingGoogle] = useState(null);
  const [ready, setReady] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(true);

  const dialect = dialects.find(d => d.id === selectedDialect) || null;

  function restoreProgress(p) {
    if (!p || typeof p !== "object") return;
    if (p.lastDialect) setSelectedDialect(p.lastDialect);
    if (p.knownCards) setKnownCards(p.knownCards);
    if (p.completedCategories) setProgress(p.completedCategories);
  }

  const awardXp = useCallback((amount, label) => {
    setXp(x => x + amount);
    const id = ++toastId;
    setToasts(t => [...t, { id, text: `+${amount} XP${label ? ` — ${label}` : ""}`, type: "xp" }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 1800);
  }, []);

  // Generic feedback toast — 'success' | 'error' | 'xp'. Reuses the same
  // toast host as awardXp so there's one visual system for transient feedback.
  const showToast = useCallback((text, type = "success") => {
    const id = ++toastId;
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  function dismissToast(id) {
    setToasts(t => t.filter(x => x.id !== id));
  }

  function handleGoogleSuccess(credentialResponse) {
    const credential = credentialResponse.credential;
    setAuthError(null);
    return fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setAuthError(data.detail || data.error || "Google sign-in failed");
          return { needsProfile: false, signedIn: false };
        }
        if (data.needsProfile) {
          setPendingGoogle({ credential, googleData: data.googleData });
          return { needsProfile: true, signedIn: false, googleData: data.googleData };
        }
        if (data.user) {
          localStorage.setItem("auth_token", data.token);
          setCurrentUser(data.user);
          restoreProgress(data.user.progress);
          if (data.user.xp != null) setXp(data.user.xp);
          if (data.user.streak != null) setStreak(data.user.streak);
          if (data.user.lastDailyDate) {
            const today = new Date().toISOString().split("T")[0];
            setDailyCompleted(data.user.lastDailyDate === today);
          }
          setRegisteredUsers(prev => prev.some(u => u.id === data.user.id) ? prev : [...prev, data.user]);
          setSuccessMessage(`Successfully signed in. Welcome, ${data.user.firstName}!`);
          setTimeout(() => setSuccessMessage(null), 4000);
        }
        return { needsProfile: false, signedIn: true };
      })
      .catch(err => {
        console.error("Google auth failed:", err);
        setAuthError("Google sign-in failed");
        return { needsProfile: false, signedIn: false };
      });
  }

  function completeProfile(profileData) {
    if (!pendingGoogle) return Promise.resolve(false);
    setAuthError(null);
    return fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: pendingGoogle.credential, profileData }),
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok || !data.user) {
          setAuthError(data.detail || data.error || "Failed to complete profile");
          return false;
        }
        localStorage.setItem("auth_token", data.token);
        setCurrentUser(data.user);
        setRegisteredUsers(prev => prev.some(u => u.id === data.user.id) ? prev : [...prev, data.user]);
        setPendingGoogle(null);
        return true;
      })
      .catch(err => {
        console.error("Failed to complete profile:", err);
        setAuthError("Network error");
        return false;
      });
  }

  function saveProfile(profileForm) {
    const token = localStorage.getItem("auth_token");
    if (!token) return Promise.resolve(false);
    const {
      firstName, lastName, age, occupation, languageInterest, role, gender, dialectsKnown,
      intent, offerings, availability, formats, region, interests, proficiency, bio, huayKuan,
    } = profileForm;
    if (!gender) {
      setAuthError("Please select your gender");
      return Promise.resolve(false);
    }
    setAuthError(null);
    return fetch("/api/users/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        firstName, lastName, age, occupation, languageInterest, role, gender, dialectsKnown,
        intent, offerings, availability, formats, region, interests, proficiency, bio, huayKuan,
      }),
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) { setAuthError(data.error || "Failed to save profile"); return false; }
        setCurrentUser(prev => ({
          ...prev, firstName, lastName, age, occupation,
          languageInterest, role, gender, dialectsKnown,
          intent, offerings, availability, formats, region, interests, proficiency, bio, huayKuan,
          avatar: getAvatar(gender, role),
        }));
        fetch("/api/users/profiles")
          .then(r => r.json())
          .then(users => setRegisteredUsers(Array.isArray(users) ? users : []))
          .catch(err => console.error("Failed to refresh profiles:", err));
        showToast("Profile saved", "success");
        return true;
      })
      .catch(() => { setAuthError("Network error"); return false; });
  }

  function handleLogout() {
    localStorage.removeItem("auth_token");
    setCurrentUser(null);
    setPendingGoogle(null);
    setAuthError(null);
    setXp(0);
    setStreak(0);
    setDailyCompleted(false);
  }

  // Bootstrap: dictionary, community profiles, session restore
  useEffect(() => {
    fetch("/dictionary.json")
      .then(r => r.json())
      .then(data => setApiWords(data.words || []))
      .catch(() => {});

    fetch("/api/users/profiles")
      .then(r => r.json())
      .then(users => setRegisteredUsers(Array.isArray(users) ? users : []))
      .catch(err => console.error("Failed to load profiles:", err))
      .finally(() => setProfilesLoading(false));

    const token = localStorage.getItem("auth_token");
    if (token) {
      fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.user) {
            setCurrentUser(data.user);
            restoreProgress(data.user.progress);
            if (data.user.xp != null) setXp(data.user.xp);
            if (data.user.streak != null) setStreak(data.user.streak);
            if (data.user.lastDailyDate) {
              const today = new Date().toISOString().split("T")[0];
              setDailyCompleted(data.user.lastDailyDate === today);
            }
          } else {
            localStorage.removeItem("auth_token");
          }
        })
        .catch(() => {})
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  // Debounced progress persistence
  useEffect(() => {
    if (!currentUser) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    const tid = setTimeout(() => {
      fetch("/api/users/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          lastDialect: selectedDialect,
          knownCards,
          completedCategories: progress,
        }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(tid);
  }, [knownCards, progress, selectedDialect, currentUser]);

  // Debounced XP/streak persistence
  useEffect(() => {
    if (!currentUser) return;
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    const tid = setTimeout(() => {
      fetch("/api/users/xp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ xp, streak }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(tid);
  }, [xp, streak, currentUser]);

  function markDailyComplete() {
    setDailyCompleted(true);
    const today = new Date().toISOString().split("T")[0];
    const token = localStorage.getItem("auth_token");
    if (token) {
      fetch("/api/users/xp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lastDailyDate: today }),
      }).catch(() => {});
    }
  }

  const value = {
    currentUser, setCurrentUser,
    registeredUsers, setRegisteredUsers, profilesLoading,
    xp, setXp, streak, setStreak,
    dailyCompleted, setDailyCompleted, markDailyComplete,
    progress, setProgress,
    knownCards, setKnownCards,
    selectedDialect, setSelectedDialect, dialect,
    apiWords,
    authError, setAuthError,
    successMessage, setSuccessMessage,
    pendingGoogle, setPendingGoogle,
    ready,
    awardXp, toasts, dismissToast, showToast,
    handleGoogleSuccess, completeProfile, saveProfile, handleLogout, restoreProgress,
    XP_REWARDS,
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <AppContext.Provider value={value}>{children}</AppContext.Provider>
    </GoogleOAuthProvider>
  );
}
