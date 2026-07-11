'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { getAvatar } from "@/lib/avatar";
import { XP_REWARDS } from "@/data/xpSystem";
import { dialects } from "@/data/staticData";

const AppContext = createContext(null);

const GUEST_KEY = "tiagong_guest_progress";

function readGuestProgress() {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeGuestProgress(data) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable (private mode quota, etc.) — guest progress
    // just won't persist across reloads; not worth surfacing to the user.
  }
}

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
  const [lastDailyDate, setLastDailyDate] = useState(null);
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
  const [overlay, setOverlay] = useState({ variants: {}, newWords: [] });

  const dialect = dialects.find(d => d.id === selectedDialect) || null;

  function restoreProgress(p) {
    if (!p || typeof p !== "object") return;
    if (p.lastDialect) setSelectedDialect(p.lastDialect);
    if (p.knownCards) setKnownCards(p.knownCards);
    if (p.completedCategories) setProgress(p.completedCategories);
  }

  // Called right after sign-in: folds any progress made as a guest on this
  // device into the now-current account, so learning done before signing in
  // isn't lost. Known-cards/categories union together; xp/streak take the
  // higher of the two (never lose guest progress, never double-award).
  function mergeGuestProgress() {
    const guest = readGuestProgress();
    if (!guest) return;
    if (guest.knownCards) setKnownCards(prev => ({ ...guest.knownCards, ...prev }));
    if (guest.completedCategories) setProgress(prev => ({ ...guest.completedCategories, ...prev }));
    if (guest.xp != null) setXp(prev => Math.max(prev, guest.xp));
    if (guest.streak != null) setStreak(prev => Math.max(prev, guest.streak));
    if (guest.lastDialect) setSelectedDialect(prev => prev || guest.lastDialect);
    localStorage.removeItem(GUEST_KEY);
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
            setLastDailyDate(data.user.lastDailyDate);
            const today = new Date().toISOString().split("T")[0];
            setDailyCompleted(data.user.lastDailyDate === today);
          }
          mergeGuestProgress();
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
        mergeGuestProgress();
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
    localStorage.removeItem(GUEST_KEY);
    setCurrentUser(null);
    setPendingGoogle(null);
    setAuthError(null);
    setXp(0);
    setStreak(0);
    setDailyCompleted(false);
    setLastDailyDate(null);
    // Clear this user's learning state so it can't bleed into whoever signs
    // in next (or the next guest session) on this device.
    setKnownCards({});
    setProgress({});
    setSelectedDialect(null);
  }

  // Bootstrap: dictionary, community profiles, session restore
  useEffect(() => {
    fetch("/dictionary.json")
      .then(r => r.json())
      .then(data => setApiWords(data.words || []))
      .catch(() => {});

    fetch("/api/contributions/overlay")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.variants) {
          setOverlay({ variants: data.variants || {}, newWords: Array.isArray(data.newWords) ? data.newWords : [] });
        }
      })
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
              setLastDailyDate(data.user.lastDailyDate);
              const today = new Date().toISOString().split("T")[0];
              setDailyCompleted(data.user.lastDailyDate === today);
            }
          } else {
            localStorage.removeItem("auth_token");
            restoreProgress(readGuestProgress());
          }
        })
        .catch(() => {})
        .finally(() => setReady(true));
    } else {
      const guest = readGuestProgress();
      if (guest) {
        restoreProgress(guest);
        if (guest.xp != null) setXp(guest.xp);
        if (guest.streak != null) setStreak(guest.streak);
        if (guest.lastDailyDate) {
          setLastDailyDate(guest.lastDailyDate);
          const today = new Date().toISOString().split("T")[0];
          setDailyCompleted(guest.lastDailyDate === today);
        }
      }
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

  // Guest persistence: mirror the same progress/xp/streak into localStorage
  // when nobody's signed in, so it survives a reload and can be merged into
  // an account later (mergeGuestProgress).
  useEffect(() => {
    if (currentUser) return;
    const tid = setTimeout(() => {
      writeGuestProgress({ knownCards, completedCategories: progress, lastDialect: selectedDialect, xp, streak, lastDailyDate });
    }, 1500);
    return () => clearTimeout(tid);
  }, [knownCards, progress, selectedDialect, xp, streak, lastDailyDate, currentUser]);

  // The single owner of the daily-streak calculation: called once, exactly
  // when the learner finishes today's FIRST daily challenge run. Increments
  // the streak if yesterday was the last completion, resets to 1 otherwise,
  // and keeps lastDailyDate (both local state and currentUser) in sync so a
  // same-session "Try Again" replay reads the freshly-updated date instead of
  // a stale one.
  function markDailyComplete() {
    setDailyCompleted(true);
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    setStreak(prev => (lastDailyDate === yesterday ? prev + 1 : lastDailyDate === today ? prev : 1));
    setLastDailyDate(today);
    setCurrentUser(prev => prev ? { ...prev, lastDailyDate: today } : prev);
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
    registeredUsers, setRegisteredUsers, profilesLoading, overlay,
    xp, setXp, streak, setStreak,
    dailyCompleted, setDailyCompleted, markDailyComplete, lastDailyDate,
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
