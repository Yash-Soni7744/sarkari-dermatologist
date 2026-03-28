import Link from 'next/link';

export default function BlogPage() {
    const posts = [
        {
            title: "How to Manage Adult Acne",
            excerpt: "Acne isn't just for teenagers. Learn about the causes and treatments for adult acne.",
            category: "Skincare",
            date: "Feb 10, 2024"
        },
        {
            title: "Understanding Hair Loss: Telogen Effluvium",
            excerpt: "Experiencing sudden hair fall? It might be stress-related. Here's what you need to know.",
            category: "Hair Care",
            date: "Jan 28, 2024"
        },
        {
            title: "Sunscreen: Your Best Anti-Aging Tool",
            excerpt: "Why wearing sunscreen indoors is just as important as outdoors.",
            category: "Anti-Aging",
            date: "Jan 15, 2024"
        },
        {
            title: "Diet and Skin: The Connection",
            excerpt: "Does chocolate really cause acne? We debunk common myths about food and skin health.",
            category: "Wellness",
            date: "Dec 20, 2023"
        }
    ];

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Patient Education Hub</h1>
            <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem' }}>
                Expert advice, skincare tips, and medical insights to help you take better care of your skin.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                {posts.map((post, idx) => (
                    <article key={idx} style={{
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ height: '200px', backgroundColor: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)' }}>
                            Blog Image
                        </div>
                        <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                                {post.category}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{post.title}</h3>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                                {post.excerpt}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--muted-foreground)', fontSize: '0.8rem' }}>
                                <span>{post.date}</span>
                                <Link href="#" style={{ color: 'var(--primary)', fontWeight: 500 }}>Read More</Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
