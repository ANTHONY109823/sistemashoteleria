import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { FaUser, FaBed, FaCalendarCheck, FaSearch } from 'react-icons/fa';
import { guestService, roomService, reservationService } from '../../services/api';
import './GlobalSearch.css';

interface SearchResult {
    id: string;
    type: 'guest' | 'room' | 'reservation' | 'roomtype';
    title: string;
    subtitle: string;
    icon: React.ReactNode;
}

const GlobalSearch = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<{
        guests: SearchResult[];
        rooms: SearchResult[];
        reservations: SearchResult[];
    }>({
        guests: [],
        rooms: [],
        reservations: []
    });

    const navigate = useNavigate();
    const abortControllerRef = useRef<AbortController>();

    // Keyboard shortcut listener (⌘K / Ctrl+K)
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Debounced search function
    const performSearch = async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults({ guests: [], rooms: [], reservations: [] });
            return;
        }

        // Cancel previous request
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);

        try {
            // Parallel search across all entities
            const [guestsData, roomsData, reservationsData] = await Promise.all([
                guestService.getAll().catch(() => []),
                roomService.getAll().catch(() => []),
                reservationService.getAll().catch(() => [])
            ]);

            const queryLower = searchQuery.toLowerCase();

            // Filter guests
            const guestResults: SearchResult[] = guestsData
                .filter(g =>
                    g.firstName.toLowerCase().includes(queryLower) ||
                    g.lastName.toLowerCase().includes(queryLower) ||
                    g.email.toLowerCase().includes(queryLower) ||
                    g.identificationNumber.toLowerCase().includes(queryLower)
                )
                .slice(0, 5)
                .map(g => ({
                    id: g.id,
                    type: 'guest' as const,
                    title: `${g.firstName} ${g.lastName}`,
                    subtitle: g.email,
                    icon: <FaUser className="text-blue-500" />
                }));

            // Filter rooms
            const roomResults: SearchResult[] = roomsData
                .filter(r =>
                    r.number.toString().includes(queryLower) ||
                    r.roomTypeName?.toLowerCase().includes(queryLower)
                )
                .slice(0, 5)
                .map(r => ({
                    id: r.id,
                    type: 'room' as const,
                    title: `Room ${r.number}`,
                    subtitle: r.roomTypeName || 'Standard',
                    icon: <FaBed className="text-indigo-500" />
                }));

            // Filter reservations
            const reservationResults: SearchResult[] = reservationsData
                .filter(res =>
                    res.guestName?.toLowerCase().includes(queryLower) ||
                    res.roomNumber?.toLowerCase().includes(queryLower)
                )
                .slice(0, 5)
                .map(res => ({
                    id: res.id,
                    type: 'reservation' as const,
                    title: `${res.guestName} - Room ${res.roomNumber}`,
                    subtitle: new Date(res.checkInDate).toLocaleDateString(),
                    icon: <FaCalendarCheck className="text-green-500" />
                }));

            setResults({
                guests: guestResults,
                rooms: roomResults,
                reservations: reservationResults
            });
        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('Search failed:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    // Debounce implementation
    const debounce = <T extends (...args: any[]) => any>(
        func: T,
        wait: number
    ): ((...args: Parameters<T>) => void) => {
        let timeout: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    };

    const debouncedSearch = useMemo(
        () => debounce(performSearch, 300),
        []
    );

    useEffect(() => {
        debouncedSearch(query);
    }, [query, debouncedSearch]);

    const handleSelect = (result: SearchResult) => {
        setOpen(false);
        setQuery('');

        // Navigate based on type
        switch (result.type) {
            case 'guest':
                navigate('/guests');
                break;
            case 'room':
                navigate('/rooms');
                break;
            case 'reservation':
                navigate('/reservations');
                break;
        }
    };

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Search"
            className="global-search-dialog"
        >
            <div className="global-search-container">
                <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <Command.Input
                        value={query}
                        onValueChange={setQuery}
                        placeholder="Search guests, rooms, reservations..."
                        className="search-input"
                    />
                    {loading && <div className="search-loading"></div>}
                </div>

                <Command.List className="search-results">
                    <Command.Empty className="search-empty">
                        {query.length < 2 ? (
                            <div className="empty-state">
                                <FaSearch className="empty-icon" />
                                <p>Type to search...</p>
                                <p className="empty-hint">Search across guests, rooms, and reservations</p>
                            </div>
                        ) : (
                            <div className="empty-state">
                                <p>No results found</p>
                                <p className="empty-hint">Try different keywords</p>
                            </div>
                        )}
                    </Command.Empty>

                    {results.guests.length > 0 && (
                        <Command.Group heading="Guests" className="search-group">
                            {results.guests.map((result) => (
                                <Command.Item
                                    key={result.id}
                                    value={result.title}
                                    onSelect={() => handleSelect(result)}
                                    className="search-item"
                                >
                                    {result.icon}
                                    <div className="item-content">
                                        <div className="item-title">{result.title}</div>
                                        <div className="item-subtitle">{result.subtitle}</div>
                                    </div>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}

                    {results.rooms.length > 0 && (
                        <Command.Group heading="Rooms" className="search-group">
                            {results.rooms.map((result) => (
                                <Command.Item
                                    key={result.id}
                                    value={result.title}
                                    onSelect={() => handleSelect(result)}
                                    className="search-item"
                                >
                                    {result.icon}
                                    <div className="item-content">
                                        <div className="item-title">{result.title}</div>
                                        <div className="item-subtitle">{result.subtitle}</div>
                                    </div>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}

                    {results.reservations.length > 0 && (
                        <Command.Group heading="Reservations" className="search-group">
                            {results.reservations.map((result) => (
                                <Command.Item
                                    key={result.id}
                                    value={result.title}
                                    onSelect={() => handleSelect(result)}
                                    className="search-item"
                                >
                                    {result.icon}
                                    <div className="item-content">
                                        <div className="item-title">{result.title}</div>
                                        <div className="item-subtitle">{result.subtitle}</div>
                                    </div>
                                </Command.Item>
                            ))}
                        </Command.Group>
                    )}
                </Command.List>

                <div className="search-footer">
                    <div className="footer-shortcuts">
                        <span><kbd>↑↓</kbd> Navigate</span>
                        <span><kbd>Enter</kbd> Select</span>
                        <span><kbd>Esc</kbd> Close</span>
                    </div>
                    <span className="footer-hint">
                        <kbd>{navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}</kbd>
                        <kbd>K</kbd> to toggle
                    </span>
                </div>
            </div>
        </Command.Dialog>
    );
};

export default GlobalSearch;
