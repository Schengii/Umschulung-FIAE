// Supabase REST API Synchronization Client
export const supabaseSync = {
    getHeaders(profile) {
        return {
            'apikey': profile.supabaseAnonKey,
            'Authorization': `Bearer ${profile.supabaseAnonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        };
    },

    async syncJobs(profile, jobs) {
        if (!profile.supabaseUrl || !profile.supabaseAnonKey) return;
        try {
            const cleanJobs = jobs.map(j => ({
                id: j.id,
                title: j.title,
                company: j.company,
                location: j.location || '',
                work_mode: j.workMode || '',
                salary: j.salary || 0,
                url: j.url || '',
                deadline: j.deadline || '',
                description: j.description || '',
                status: j.status || 'saved',
                contact: j.contact || '',
                notes: j.notes || '',
                ratings: JSON.stringify(j.ratings || {}),
                history: JSON.stringify(j.history || []),
                created_at: j.createdAt || new Date().toISOString()
            }));

            const url = `${profile.supabaseUrl}/rest/v1/jobs`;
            const headers = this.getHeaders(profile);
            
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(cleanJobs)
            });
            if (!response.ok) {
                console.warn('Supabase jobs sync failed:', response.statusText);
            }
        } catch (e) {
            console.error('Supabase jobs sync error:', e);
        }
    },

    async syncProfile(profile) {
        if (!profile.supabaseUrl || !profile.supabaseAnonKey) return;
        try {
            const url = `${profile.supabaseUrl}/rest/v1/profiles`;
            const headers = this.getHeaders(profile);
            
            const profileRow = {
                id: 'current-profile',
                name: profile.name || '',
                title: profile.title || '',
                skills: JSON.stringify(profile.skills || []),
                experience: profile.experience || '',
                tax_class: profile.taxClass || '1',
                church_tax: profile.churchTax || '0',
                has_children: !!profile.hasChildren
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify([profileRow])
            });
            if (!response.ok) {
                console.warn('Supabase profile sync failed:', response.statusText);
            }
        } catch (e) {
            console.error('Supabase profile sync error:', e);
        }
    }
};
