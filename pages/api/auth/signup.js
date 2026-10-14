import { useState, useRef } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

function AuthForm() {
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  async function submitHandler(event) {
    event.preventDefault();

    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    if (isLogin) {
      // --- LOG IN ---
      const result = await signIn('credentials', {
        redirect: false,
        email: enteredEmail,
        password: enteredPassword,
      });

      if (!result.error) {
        // წარმატებული შესვლისას გადადის /profile-ზე
        router.replace('/profile');
      } else {
        alert(result.error);
      }

    } else {
      // --- SIGN UP ---
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ email: enteredEmail, password: enteredPassword }),
          headers: { 'Content-Type': 'application/json' },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Something went wrong!');
        }

        // რეგისტრაციის შემდეგ ავტომატური ავტორიზაცია და გადამისამართება
        const result = await signIn('credentials', {
          redirect: false,
          email: enteredEmail,
          password: enteredPassword,
        });

        if (!result.error) {
          router.replace('/profile');
        }

      } catch (error) {
        alert(error.message);
      }
    }
  }

  // ... დანარჩენი JSX კოდი
}