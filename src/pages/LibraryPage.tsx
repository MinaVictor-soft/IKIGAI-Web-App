import { useTranslation } from 'react-i18next'
import { BookOpen, Download, Share2, Search } from 'lucide-react'
import { useState } from 'react'

export default function LibraryPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')

  // Mock publications data
  const publications = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    title: `Publication ${i + 1}`,
    author: `Author ${i + 1}`,
    category: ['Technology', 'Business', 'Education', 'Sports'][i % 4],
    description: 'Brief description of the publication content goes here',
    views: Math.floor(Math.random() * 1000),
    downloads: Math.floor(Math.random() * 500),
    image: `https://via.placeholder.com/300x200?text=Publication+${i + 1}`,
  }))

  const filteredPublications = publications.filter(
    pub =>
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('library')}</h1>
        <p className="text-white/80">Explore educational content and publications</p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3 text-text-muted" size={20} />
            <input
              type="text"
              placeholder={t('search') || 'Search publications...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-lg text-text placeholder-text-muted focus:outline-none focus:border-primary transition"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-text-muted text-sm">
            Showing {filteredPublications.length} of {publications.length} publications
          </p>
        </div>

        {/* Publications Grid */}
        {filteredPublications.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredPublications.map((pub) => (
              <div
                key={pub.id}
                className="bg-surface border border-border rounded-lg overflow-hidden hover:border-primary hover:shadow-lg transition duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="bg-gradient-to-br from-primary to-secondary h-40 md:h-48 relative overflow-hidden">
                  <img
                    src={pub.image}
                    alt={pub.title}
                    className="w-full h-full object-cover opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen size={48} className="text-white/50" />
                  </div>
                  <div className="absolute top-2 right-2 bg-primary px-2 py-1 rounded text-xs font-semibold text-white">
                    {pub.category}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-base md:text-lg mb-1 line-clamp-2 text-white">
                    {pub.title}
                  </h3>
                  <p className="text-sm text-text-muted mb-2">{pub.author}</p>
                  <p className="text-xs text-text-muted mb-4 flex-1 line-clamp-2">
                    {pub.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-text-muted mb-4 py-2 border-t border-border/50">
                    <span>👁️ {pub.views}</span>
                    <span>⬇️ {pub.downloads}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-primary hover:bg-secondary text-white font-bold py-2 px-3 rounded-lg transition text-sm flex items-center justify-center gap-1">
                      <Download size={16} />
                      {t('download') || 'Download'}
                    </button>
                    <button className="flex-1 border border-primary hover:bg-primary/10 text-primary font-bold py-2 px-3 rounded-lg transition text-sm flex items-center justify-center gap-1">
                      <Share2 size={16} />
                      {t('share') || 'Share'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen size={64} className="mx-auto text-text-muted mb-4 opacity-50" />
            <p className="text-text-muted text-lg mb-4">No publications found</p>
            <button
              onClick={() => setSearchQuery('')}
              className="bg-primary hover:bg-secondary text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
