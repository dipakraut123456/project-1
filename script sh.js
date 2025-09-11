const API_KEY = "937dccff1805496da4c6975bdce9886a";
const url = "https://newsapi.org/v2/everything?q=";

window.addEventListener("load", () => fetchNews("World"));

function reload() {
    window.location.reload();
}

async function fetchNews(query) {
    try {
        document.getElementById("cards-container").innerHTML = "<div class='loading-spinner'><i class='fas fa-spinner fa-spin'></i> Loading news...</div>";
        
        const res = await fetch(`${url}${query}&apiKey=${API_KEY}`);
        if (!res.ok) {
            throw new Error(`API request failed with status ${res.status}`);
        }
        const data = await res.json();
        bindData(data.articles);
    } catch (error) {
        console.error("Error fetching news:", error);
        document.getElementById("cards-container").innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load news. Please try again later.</p>
                <button onclick="fetchNews('${query}')">Retry</button>
            </div>
        `;
    }
}

function bindData(articles) {
    const cardsContainer = document.getElementById("cards-container");
    const newsCardTemplate = document.getElementById("template-news-card");

    cardsContainer.innerHTML = "";

    if (!articles || articles.length === 0) {
        cardsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-newspaper"></i>
                <p>No news articles found. Try a different search.</p>
            </div>
        `;
        return;
    }

    articles.forEach((article) => {
        if (!article.urlToImage) return;
        const cardClone = newsCardTemplate.content.cloneNode(true);
        fillDataInCard(cardClone, article);
        cardsContainer.appendChild(cardClone);
    });
}

function fillDataInCard(cardClone, article) {
    const newsImg = cardClone.querySelector("#news-img");
    const newsTitle = cardClone.querySelector("#news-title");
    const newsSource = cardClone.querySelector("#news-source");
    const newsDesc = cardClone.querySelector("#news-desc");
    const shareButton = cardClone.querySelector(".share-button");
    const newsCategory = cardClone.querySelector(".news-category");

    // Set category based on query or source
    const categoryMap = {
        'india': 'India',
        'finance': 'Finance',
        'business': 'Business',
        'technology': 'Tech'
    };
    
    const currentCategory = window.location.search.includes('q=') ? 
        window.location.search.split('q=')[1].split('&')[0].toLowerCase() : 
        Object.keys(categoryMap).find(key => article.title.toLowerCase().includes(key) || 
                                           article.description.toLowerCase().includes(key));
    
    newsCategory.textContent = categoryMap[currentCategory] || 'General';

    shareButton.addEventListener("click", (e) => {
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({
                title: article.title,
                text: article.description,
                url: article.url,
            }).catch(err => console.log('Share failed:', err));
        } else {
            // Fallback for browsers without Web Share API
            const shareUrl = `mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(article.description + '\n\nRead more: ' + article.url)}`;
            window.open(shareUrl, '_blank');
        }
    });

    newsImg.src = article.urlToImage;
    newsImg.onerror = () => {
        newsImg.src = 'https://via.placeholder.com/400x200?text=Image+Not+Available';
    };
    newsTitle.innerHTML = article.title;
    newsDesc.innerHTML = article.description || "No description available.";

    const date = new Date(article.publishedAt).toLocaleString("en-US", {
        timeZone: "Asia/Jakarta",
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    newsSource.innerHTML = `${article.source.name} · ${date}`;

    cardClone.firstElementChild.addEventListener("click", () => {
        window.open(article.url, "_blank");
    });
}

let curSelectedNav = null;
function onNavItemClick(id) {
    fetchNews(id);
    const navItem = document.querySelector(`.nav-menu li:nth-child(${
        Array.from(document.querySelectorAll('.nav-menu li')).findIndex(li => 
            li.textContent.trim().toLowerCase().includes(id.toLowerCase())) + 1
    })`);
    
    if (navItem) {
        curSelectedNav?.classList.remove("active");
        curSelectedNav = navItem;
        curSelectedNav.classList.add("active");
    }
}

const searchButton = document.getElementById("search-button");
const searchText = document.getElementById("search-text");

searchButton.addEventListener("click", () => {
    const query = searchText.value;
    if (!query) return;
    fetchNews(query);
    curSelectedNav?.classList.remove("active");
    curSelectedNav = null;
});

searchText.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        searchButton.click();
    }
});
