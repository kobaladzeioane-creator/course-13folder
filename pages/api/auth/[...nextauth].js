import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "../../../lib/db";
import { verifyPassword } from "../../../lib/auth";

export const authOptions = {
    session: {
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/auth',
        error: '/auth',
    },
    callbacks: {
        async redirect({ url, baseUrl }) {
            if (url.startsWith('/')) return url;
            else if (new URL(url).origin === baseUrl) return url;
            return baseUrl + '/profile';
        }
    },
    providers: [
        CredentialsProvider({
            async authorize(credentials) {
                const userEmail = credentials.email.toLowerCase().trim();

                // 1. Hardcoded credentials შემოწმება
                if (userEmail === 'kobaladzeioane@gmail.com' && credentials.password === '000000000') {
                    return { email: 'kobaladzeioane@gmail.com' };
                }

                // 2. ბაზაში მომხმარებლის ძებნა
                const client = await connectToDatabase();
                const usersCollection = client.db('auth').collection('users');
                const user = await usersCollection.findOne({ email: userEmail });

                if (!user) {
                    throw new Error('No users found!');
                }

                // 3. პაროლის შემოწმება
                const isValid = await verifyPassword(credentials.password, user.password);

                if (!isValid) {
                    throw new Error('Could not log you in!');
                }

                return { email: user.email };
            }
        })
    ]
};

export default NextAuth(authOptions);