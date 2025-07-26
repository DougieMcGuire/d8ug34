// BioModule.js - Handles bio link routing and display
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

class BioModule {
    constructor() {
        this.firebaseConfig = {
            apiKey: "AIzaSyAvcAd9o-HGRGRpW4b-gocl11vVrXiONvU",
            authDomain: "furgusbio.firebaseapp.com",
            projectId: "furgusbio",
            storageBucket: "furgusbio.firebasestorage.app",
            messagingSenderId: "175548520637",
            appId: "1:175548520637:web:1690b607d8647f40247fd4",
            measurementId: "G-DXTSKVPV7S"
        };

        this.app = initializeApp(this.firebaseConfig);
        this.db = getFirestore(this.app);
        this.currentProfile = null;

        this.reservedUsernames = [
            'bio', 'docs', 'website', 'pricing', 'sponsors', '404', 'rate', 
            'graphic', 'wc', 'gd', 'bl', 'founder', 'info', 'main', 'home',
            'admin', 'api', 'www', 'mail', 'ftp', 'support', 'help', 'create', 'auth'
        ];

        this.platformIcons = {
            'custom': '🌐',
            'tiktok': '🎵',
            'twitter': '🐦',
            'instagram': '📷',
            'facebook': '👤',
            'snapchat': '👻',
            'pinterest': '📌',
            'reddit': '🤖',
            'bluesky': ☁️',
            'github': '💻',
            'youtube': '📺',
            'linkedin': '💼',
            'discord': '🎮',
            'twitch': '🎮',
            'telegram': '✈️'
        };

        this.socialPlatforms = {
            'custom': 'Custom Website',
            'tiktok': 'TikTok',
            'twitter': 'Twitter/X',
            'instagram': 'Instagram',
            'facebook': 'Facebook',
            'snapchat': 'Snapchat',
            'pinterest': 'Pinterest',
            'reddit': 'Reddit',
            'bluesky': 'Bluesky',
            'github': 'GitHub',
            'youtube': 'YouTube',
            'linkedin': 'LinkedIn',
            'discord': 'Discord',
            'twitch': 'Twitch',
            'telegram': 'Telegram'
        };

        this.init();
    }

    init() {
        // Handle routing when the module loads
        this.handleRouting();
        
        // Listen for popstate events (back/forward buttons)
        window.addEventListener('popstate', () => {
            this.handleRouting();
        });
    }

    handleRouting() {
        const path = window.location.pathname;
        
        if (path === '/' || path === '') {
            // Redirect to /home
            window.history.replaceState({}, '', '/home');
            this.redirectToHome();
        } else if (this.reservedUsernames.includes(path.substring(1))) {
            // Handle reserved routes
            this.handleReservedRoute(path.substring(1));
        } else {
            // Try to load bio profile
            const username = path.substring(1);
            this.loadBioProfile(username);
        }
    }

    redirectToHome() {
        // Redirect to your actual home page
        window.location.href = '/home';
    }

    handleReservedRoute(route) {
        switch(route) {
            case 'home':
                this.redirectToHome();
                break;
            case 'auth':
                window.location.href = '/auth.html';
                break;
            case 'create':
                window.location.href = '/create.html';
                break;
            default:
                // For other reserved routes, redirect to home or show 404
                this.redirectToHome();
                break;
        }
    }

    async loadBioProfile(username) {
        this.showLoading();
        
        try {
            // Get user ID from username
            const usernameDoc = await getDoc(doc(this.db, 'usernames', username));
            if (!usernameDoc.exists()) {
                this.showError('Profile not found');
                return;
            }
            
            const userId = usernameDoc.data().userId;
            const profileDoc = await getDoc(doc(this.db, 'profiles', userId));
            
            if (!profileDoc.exists()) {
                this.showError('Profile not found');
                return;
            }
            
            const profileData = profileDoc.data();
            this.currentProfile = profileData;
            this.displayBioProfile(profileData);
            
        } catch (error) {
            console.error('Error loading bio profile:', error);
            this.showError('Error loading profile');
        }
    }

    displayBioProfile(profileData) {
        // Clear the body and create bio profile
        document.body.innerHTML = '';
        document.body.className = `bg-${profileData.backgroundColor}`;
        
        // Determine which logo to use
        const isDarkBackground = ['black', 'gray', 'indigo'].includes(profileData.backgroundColor);
        const logoSrc = isDarkBackground ? 'MWF2.png' : 'MWF.png';
        
        // Create the bio profile HTML
        const bioHTML = `
            <div class="bio-container">
                <img src="${logoSrc}" alt="Furgus" class="logo">
                <div class="profile-card">
                    <img src="${profileData.profilePicture || this.getDefaultProfilePic()}" alt="Profile" class="profile-picture">
                    <div class="profile-name">${profileData.displayName}</div>
                    <div class="profile-url">furgus.org/${profileData.username}</div>
                    <div class="social-links">
                        ${this.generateSocialLinks(profileData.links || [])}
                    </div>
                    <div class="like-section">
                        <button class="like-button ${this.isProfileLiked(profileData.username) ? 'liked' : ''}" onclick="bioModule.toggleLike()">♥</button>
                        <span class="like-count">${profileData.likes || 0} likes</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.innerHTML = bioHTML;
        this.addBioStyles();
        
        // Make bioModule globally accessible for onclick handlers
        window.bioModule = this;
    }

    generateSocialLinks(links) {
        return links.map(link => `
            <a href="${link.url}" target="_blank" class="social-link">
                <div class="link-content">
                    <div class="link-icon">${this.platformIcons[link.platform] || '🔗'}</div>
                    <div class="link-text">
                        <span class="link-title">${link.title}</span>
                        <span class="link-subtitle">${this.socialPlatforms[link.platform] || 'Custom'}</span>
                    </div>
                </div>
            </a>
        `).join('');
    }

    getDefaultProfilePic() {
        return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%23ddd'/%3E%3Ccircle cx='40' cy='30' r='12' fill='%23999'/%3E%3Cellipse cx='40' cy='60' rx='20' ry='15' fill='%23999'/%3E%3C/svg%3E";
    }

    isProfileLiked(username) {
        const likedProfiles = JSON.parse(localStorage.getItem('likedProfiles') || '[]');
        return likedProfiles.includes(username);
    }

    async toggleLike() {
        if (!this.currentProfile) return;
        
        const username = this.currentProfile.username;
        const likedProfiles = JSON.parse(localStorage.getItem('likedProfiles') || '[]');
        const isLiked = likedProfiles.includes(username);
        
        try {
            const profileRef = doc(this.db, 'profiles', this.currentProfile.userId);
            
            if (isLiked) {
                // Unlike
                await updateDoc(profileRef, { likes: increment(-1) });
                const index = likedProfiles.indexOf(username);
                likedProfiles.splice(index, 1);
                document.querySelector('.like-button').classList.remove('liked');
            } else {
                // Like
                await updateDoc(profileRef, { likes: increment(1) });
                likedProfiles.push(username);
                document.querySelector('.like-button').classList.add('liked');
            }
            
            localStorage.setItem('likedProfiles', JSON.stringify(likedProfiles));
            
            // Update like count display
            const currentCount = parseInt(document.querySelector('.like-count').textContent);
            const newCount = isLiked ? currentCount - 1 : currentCount + 1;
            document.querySelector('.like-count').textContent = `${newCount} likes`;
            
        } catch (error) {
            console.error('Error updating likes:', error);
        }
    }

    showLoading() {
        document.body.innerHTML = `
            <div class="loading">
                <h2>Loading...</h2>
            </div>
        `;
        document.body.className = 'bg-purple';
        this.addBioStyles();
    }

    showError(message) {
        document.body.innerHTML = `
            <div class="error-container">
                <h2>Oops!</h2>
                <p>${message}</p>
                <a href="/home" class="home-link">Go Home</a>
            </div>
        `;
        document.body.className = 'bg-purple';
        this.addBioStyles();
    }

    addBioStyles() {
        // Check if styles already exist
        if (document.querySelector('#bio-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'bio-styles';
        style.textContent = `
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }

            body {
                font-family: 'Arial', sans-serif;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }

            .bio-container {
                max-width: 400px;
                width: 100%;
                text-align: center;
                position: relative;
                padding: 2rem;
            }

            .logo {
                width: 120px;
                height: auto;
                margin-bottom: 2rem;
            }

            .profile-card {
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 2rem;
                border: 1px solid rgba(255, 255, 255, 0.2);
                position: relative;
                overflow: hidden;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }

            .profile-picture {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                margin: 0 auto 1rem;
                object-fit: cover;
                border: 3px solid rgba(255, 255, 255, 0.3);
                display: block;
            }

            .profile-name {
                font-size: 1.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }

            .profile-url {
                font-size: 0.9rem;
                opacity: 0.7;
                margin-bottom: 2rem;
            }

            .social-links {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .social-link {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                padding: 1rem;
                border-radius: 12px;
                color: white;
                text-decoration: none;
                display: flex;
                align-items: center;
                justify-content: flex-start;
                transition: all 0.3s ease;
                cursor: pointer;
            }

            .social-link:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }

            .link-content {
                display: flex;
                align-items: center;
                gap: 1rem;
                flex: 1;
                text-align: left;
            }

            .link-icon {
                width: 24px;
                height: 24px;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
            }

            .link-text {
                flex: 1;
            }

            .link-title {
                font-weight: bold;
                display: block;
                font-size: 1rem;
            }

            .link-subtitle {
                font-size: 0.8rem;
                opacity: 0.7;
                margin-top: 0.2rem;
                display: block;
            }

            .like-section {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1rem;
            }

            .like-button {
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 1.5rem;
                transition: all 0.2s ease;
                padding: 0.5rem;
                border-radius: 50%;
            }

            .like-button:hover {
                transform: scale(1.2);
                background: rgba(255, 255, 255, 0.1);
            }

            .like-button.liked {
                color: #ff6b6b;
            }

            .like-count {
                font-size: 1rem;
                opacity: 0.8;
            }

            .loading, .error-container {
                text-align: center;
                padding: 2rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }

            .error-container h2 {
                font-size: 2rem;
                margin-bottom: 1rem;
                color: #ff6b6b;
            }

            .error-container p {
                margin-bottom: 2rem;
                opacity: 0.8;
            }

            .home-link {
                background: linear-gradient(45deg, #48dbfb, #0abde3);
                color: white;
                padding: 1rem 2rem;
                border-radius: 12px;
                text-decoration: none;
                transition: transform 0.3s ease;
            }

            .home-link:hover {
                transform: translateY(-2px);
            }

            /* Background color classes */
            .bg-purple { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .bg-pink { background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%); }
            .bg-blue { background: linear-gradient(135deg, #48dbfb 0%, #0abde3 100%); }
            .bg-green { background: linear-gradient(135deg, #26de81 0%, #20bf6b 100%); }
            .bg-orange { background: linear-gradient(135deg, #feca57 0%, #ff9ff3 100%); }
            .bg-red { background: linear-gradient(135deg, #ff6348 0%, #ff7675 100%); }
            .bg-teal { background: linear-gradient(135deg, #00d2d3 0%, #54a0ff 100%); }
            .bg-indigo { background: linear-gradient(135deg, #5f27cd 0%, #341f97 100%); }
            .bg-yellow { background: linear-gradient(135deg, #f9ca24 0%, #f0932b 100%); }
            .bg-emerald { background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); }
            .bg-violet { background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%); }
            .bg-rose { background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%); }
            .bg-sky { background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); }
            .bg-lime { background: linear-gradient(135deg, #a4b0be 0%, #57606f 100%); }
            .bg-black { background: linear-gradient(135deg, #2c2c54 0%, #40407a 100%); }
            .bg-gray { background: linear-gradient(135deg, #57606f 0%, #2f3542 100%); }

            @media (max-width: 768px) {
                .bio-container {
                    padding: 1rem;
                }
                
                .profile-card {
                    padding: 1.5rem;
                }
                
                .logo {
                    width: 100px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Initialize the BioModule when the script loads
const bioModule = new BioModule();

export default BioModule;