import { supabase } from "../utils/supabase";

export const riderService = {
    async getRiderUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) throw new Error("User not authenticated");
        return user;
    },

    async fetchActiveOrders(userId: string) {
        const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .gte('created_at', threeHoursAgo)
            .or(`status.eq.approved,and(rider_id.eq.${userId},status.in.(accepted,picked_up,delivered))`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    async updateLocation(userId: string, coords: { latitude: number; longitude: number }) {
        // Update rider location for orders that are accepted or picked_up
        const { error } = await supabase
            .from('orders')
            .update({
                rider_lat: coords.latitude,
                rider_lng: coords.longitude
            })
            .eq('rider_id', userId)
            .in('status', ['accepted', 'picked_up']);

        if (error) console.warn("Location Update Sync Error:", error.message);
    },

    async acceptOrder(userId: string, orderId: string) {
        // Atomic-like check: select first to ensure it's still 'approved'
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('status')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) throw new Error("Order not found");
        if (order.status !== 'approved') throw new Error("Order already taken or unavailable");

        const { error: updateError } = await supabase
            .from('orders')
            .update({
                status: 'accepted',
                rider_id: userId
            })
            .eq('id', orderId)
            .eq('status', 'approved'); // Double check status in update query

        if (updateError) throw updateError;
    },

    async updateStatus(orderId: string, status: string) {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);

        if (error) throw error;
    },

    async fetchStats(userId: string) {
        const { data: completed, error } = await supabase
            .from('orders')
            .select('total_price, created_at')
            .eq('rider_id', userId)
            .eq('status', 'completed');

        if (error) throw error;

        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let daily = 0, weekly = 0, monthly = 0;
        completed?.forEach(order => {
            const date = new Date(order.created_at);
            const price = Number(order.total_price);
            if (date >= startOfDay) daily += price;
            if (date >= startOfWeek) weekly += price;
            if (date >= startOfMonth) monthly += price;
        });

        return { daily, weekly, monthly };
    }
};
