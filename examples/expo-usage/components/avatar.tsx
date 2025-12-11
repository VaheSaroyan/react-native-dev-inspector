import {StyleSheet, View,Text} from "react-native";

export function Avatar({ name }: { name: string }) {
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();

    return (
        <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a2e',
    },
    header: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#16213e',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#eee',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    profileCard: {
        backgroundColor: '#16213e',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e94560',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarText: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    profileName: {
        fontSize: 20,
        fontWeight: '600',
        color: '#eee',
        marginBottom: 4,
    },
    profileRole: {
        fontSize: 14,
        color: '#aaa',
        marginBottom: 12,
    },
    profileBio: {
        fontSize: 14,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        backgroundColor: '#e94560',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#e94560',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    buttonTextSecondary: {
        color: '#e94560',
    },
    controls: {
        backgroundColor: '#16213e',
        borderRadius: 16,
        padding: 20,
    },
    controlsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#eee',
        marginBottom: 16,
        textAlign: 'center',
    },
    activeHint: {
        color: '#4ecdc4',
        fontSize: 12,
        textAlign: 'center',
        marginTop: 12,
    },
});
