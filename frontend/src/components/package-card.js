// Reusable Package Card component
export function createPackageCard(pkg) {
  const types = ['🏔️ Adventure', '🏖️ Beach', '🌿 Nature', '🏛️ Heritage', '🌆 City'];
  const typeBadge = pkg.package_type || types[Math.floor(Math.random() * types.length)];
  const duration = pkg.duration || `${pkg.duration_days || '?'}D/${pkg.duration_nights || '?'}N`;

  return `
    <div class="glass-card package-card" data-link href="/package/${pkg.id}">
      <div class="package-image">
        <div class="package-badge">${typeBadge}</div>
      </div>
      <div class="package-body">
        <h3 class="package-title">${pkg.title || 'Untitled Package'}</h3>
        <div class="package-meta">
          <span>📍 ${pkg.destination || 'Unknown'}</span>
          <span>⏱ ${duration}</span>
          <span>👥 Max ${pkg.max_people || '?'}</span>
        </div>
        <div class="package-price">
          ₹${(pkg.base_price || 0).toLocaleString('en-IN')}
          <small>/person</small>
        </div>
      </div>
    </div>
  `;
}
