import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Share,

} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

// Component to render tally marks
const TallyMarks = ({ count, color }: { count: number; color: string }) => {
  const groups = Math.floor(count / 5);
  const remainder = count % 5;
  
  const renderGroup = (groupIndex: number) => (
    <View key={groupIndex} style={styles.tallyGroup}>
      {/* First 4 vertical lines */}
      {[0, 1, 2, 3].map((lineIndex) => (
        <View
          key={lineIndex}
          style={[styles.tallyLine, { backgroundColor: color }]}
        />
      ))}
      {/* 5th diagonal line crossing through */}
      <View
        style={[
          styles.tallyDiagonal,
          { backgroundColor: color }
        ]}
      />
    </View>
  );
  
  const renderRemainder = () => (
    <View style={styles.tallyGroup}>
      {Array.from({ length: remainder }, (_, index) => (
        <View
          key={index}
          style={[styles.tallyLine, { backgroundColor: color }]}
        />
      ))}
    </View>
  );
  
  return (
    <View style={styles.tallyContainer}>
      {count === 0 ? (
        <Text style={styles.noMarksText}>No marks</Text>
      ) : (
        <View style={styles.tallyMarksWrapper}>
          {Array.from({ length: groups }, (_, index) => renderGroup(index))}
          {remainder > 0 && renderRemainder()}
        </View>
      )}
    </View>
  );
};

interface Counter {
  id: string;
  name: string;
  count1: number;
  count2: number;
  color: string;
}

const colorOptions = [
  { name: 'Blue', value: '#2563eb' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Teal', value: '#14b8a6' },
];

export default function App() {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [newCounterName, setNewCounterName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCounter, setEditingCounter] = useState<Counter | null>(null);

  // Load counters from AsyncStorage on mount
  useEffect(() => {
    loadCounters();
  }, []);

  // Save counters to AsyncStorage whenever counters change
  useEffect(() => {
    saveCounters();
  }, [counters, saveCounters]);

  const loadCounters = async () => {
    try {
      const savedCounters = await AsyncStorage.getItem('tallyCounters');
      if (savedCounters) {
        const parsedCounters = JSON.parse(savedCounters);
        // Migrate old single-counter format to dual-counter format
        const migratedCounters = parsedCounters.map((counter: any) => {
          if (typeof counter.count === 'number') {
            // Old format - migrate to new format
            return {
              ...counter,
              count1: counter.count,
              count2: 0,
              count: undefined // Remove old property
            };
          }
          // Already in new format
          return counter;
        });
        setCounters(migratedCounters);
      }
    } catch (error) {
      console.error('Error loading counters:', error);
    }
  };

  const saveCounters = useCallback(async () => {
    try {
      await AsyncStorage.setItem('tallyCounters', JSON.stringify(counters));
    } catch (error) {
      console.error('Error saving counters:', error);
    }
  }, [counters]);

  // Handle sharing
  const handleShare = async () => {
    try {
      await Share.share({
        message: 'Check out this digital tally counter app!',
        title: 'Digital Tally Sheet App',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const addCounter = () => {
    if (newCounterName.trim()) {
      const newCounter: Counter = {
        id: Date.now().toString(),
        name: newCounterName.trim(),
        count1: 0,
        count2: 0,
        color: selectedColor
      };
      setCounters([...counters, newCounter]);
      setNewCounterName('');
      setSelectedColor(colorOptions[0].value);
      setIsDialogOpen(false);
    }
  };

  const updateCounter = (id: string, counterType: 'count1' | 'count2', change: number) => {
    // Haptic feedback for mobile devices
    if (change !== 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setCounters(counters.map(counter => 
      counter.id === id 
        ? { ...counter, [counterType]: Math.max(0, counter[counterType] + change) }
        : counter
    ));
  };

  const resetCounter = (id: string, counterType?: 'count1' | 'count2') => {
    setCounters(counters.map(counter => 
      counter.id === id 
        ? counterType 
          ? { ...counter, [counterType]: 0 }
          : { ...counter, count1: 0, count2: 0 }
        : counter
    ));
  };

  const deleteCounter = (id: string) => {
    Alert.alert(
      'Delete Counter',
      'Are you sure you want to delete this counter?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => setCounters(counters.filter(counter => counter.id !== id))
        }
      ]
    );
  };

  const updateCounterColor = (id: string, color: string) => {
    setCounters(counters.map(counter => 
      counter.id === id ? { ...counter, color } : counter
    ));
    setEditingCounter(null);
  };

  const totalCount = counters.reduce((sum, counter) => sum + counter.count1 + counter.count2, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>Digital Tally Sheet</Text>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.shareButton}
            >
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Track multiple counters with traditional tally marks</Text>
          {counters.length > 0 && (
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>Total Count: {totalCount}</Text>
            </View>
          )}
        </View>

        {/* Add Counter Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsDialogOpen(true)}
          >
            <Text style={styles.addButtonText}>+ Add New Counter</Text>
          </TouchableOpacity>
        </View>

        {/* Counters Grid */}
        {counters.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No counters yet</Text>
            <Text style={styles.emptySubtitle}>Create your first counter to get started</Text>
          </View>
        ) : (
          <View style={styles.countersGrid}>
            {counters.map((counter) => (
              <View key={counter.id} style={[styles.counterCard, { borderColor: counter.color }]}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <Text style={styles.counterName} numberOfLines={1}>
                    {counter.name}
                  </Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      onPress={() => setEditingCounter(counter)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionButtonText}>🎨</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteCounter(counter.id)}
                      style={styles.actionButton}
                    >
                      <Text style={styles.actionButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Counter Content */}
                <View style={styles.cardContent}>
                  {/* Side-by-side layout for both counters */}
                  <View style={styles.countersRow}>
                    {/* Counter 1 - Getrunken */}
                    <View style={styles.counterSection}>
                      <View style={styles.counterDisplay}>
                        <Text style={styles.counterLabel}>Getrunken</Text>
                        <TallyMarks count={counter.count1} color={counter.color} />
                        <Text style={[styles.countText, { color: counter.color }]}>
                          Count: {counter.count1}
                        </Text>
                      </View>
                      
                      {/* Counter 1 Control Buttons */}
                      <View style={styles.controlButtons}>
                        <View style={styles.buttonRow}>
                          <TouchableOpacity
                            style={[styles.controlButton, counter.count1 === 0 && styles.disabledButton]}
                            onPress={() => updateCounter(counter.id, 'count1', -1)}
                            disabled={counter.count1 === 0}
                          >
                            <Text style={styles.controlButtonText}>-</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => updateCounter(counter.id, 'count1', 1)}
                          >
                            <Text style={styles.controlButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          style={styles.resetButton}
                          onPress={() => resetCounter(counter.id, 'count1')}
                        >
                          <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Counter 2 - Bezahlt */}
                    <View style={styles.counterSection}>
                      <View style={styles.counterDisplay}>
                        <Text style={styles.counterLabel}>Bezahlt</Text>
                        <TallyMarks count={counter.count2} color="#ef4444" />
                        <Text style={styles.countTextRed}>
                          Count: {counter.count2}
                        </Text>
                      </View>
                      
                      {/* Counter 2 Control Buttons */}
                      <View style={styles.controlButtons}>
                        <View style={styles.buttonRow}>
                          <TouchableOpacity
                            style={[styles.controlButton, counter.count2 === 0 && styles.disabledButton]}
                            onPress={() => updateCounter(counter.id, 'count2', -1)}
                            disabled={counter.count2 === 0}
                          >
                            <Text style={styles.controlButtonText}>-</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.controlButton}
                            onPress={() => updateCounter(counter.id, 'count2', 1)}
                          >
                            <Text style={styles.controlButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          style={styles.resetButton}
                          onPress={() => resetCounter(counter.id, 'count2')}
                        >
                          <Text style={styles.resetButtonText}>Reset</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {/* Difference display */}
                  <View style={styles.differenceContainer}>
                    <Text style={styles.differenceText}>
                      Difference: {counter.count2 - counter.count1}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Counter Modal */}
      <Modal
        visible={isDialogOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsDialogOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Counter</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Counter Name</Text>
              <TextInput
                style={styles.textInput}
                value={newCounterName}
                onChangeText={setNewCounterName}
                placeholder="Enter counter name..."
                onSubmitEditing={addCounter}
              />
            </View>

            <View style={styles.colorContainer}>
              <Text style={styles.inputLabel}>Choose Color</Text>
              <View style={styles.colorGrid}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color.value}
                    onPress={() => setSelectedColor(color.value)}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color.value },
                      selectedColor === color.value && styles.selectedColor
                    ]}
                  />
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsDialogOpen(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createButton}
                onPress={addCounter}
              >
                <Text style={styles.createButtonText}>Create Counter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Color Picker Modal */}
      <Modal
        visible={!!editingCounter}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingCounter(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Change Color for "{editingCounter?.name}"
            </Text>
            
            <View style={styles.colorContainer}>
              <Text style={styles.inputLabel}>Choose New Color</Text>
              <View style={styles.colorGrid}>
                {colorOptions.map((color) => (
                  <TouchableOpacity
                    key={color.value}
                    onPress={() => editingCounter && updateCounterColor(editingCounter.id, color.value)}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color.value },
                      editingCounter?.color === color.value && styles.selectedColor
                    ]}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditingCounter(null)}
            >
              <Text style={styles.cancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    textAlign: 'center',
  },
  shareButton: {
    padding: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 12,
  },
  totalBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  totalBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  addButtonContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  countersGrid: {
    gap: 16,
  },
  counterCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  counterName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 16,
  },
  cardContent: {
    gap: 16,
  },
  countersRow: {
    flexDirection: 'row',
  },
  counterSection: {
    flex: 1,
  },
  divider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 12,
  },
  counterDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  counterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 8,
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  countTextRed: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ef4444',
    marginTop: 8,
  },
  controlButtons: {
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 4,
  },
  controlButton: {
    flex: 1,
    height: 36,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  resetButton: {
    height: 32,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 12,
    color: '#6b7280',
  },
  differenceContainer: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  differenceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  tallyContainer: {
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tallyMarksWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tallyGroup: {
    position: 'relative',
    flexDirection: 'row',
    marginRight: 12,
  },
  tallyLine: {
    width: 2,
    height: 32,
    marginRight: 4,
  },
  tallyDiagonal: {
    position: 'absolute',
    top: 8,
    left: 0,
    width: 24,
    height: 2,
    transform: [{ rotate: '12deg' }],
  },
  noMarksText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#94a3b8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  colorContainer: {
    marginBottom: 20,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  selectedColor: {
    borderColor: '#1e293b',
    borderWidth: 3,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#64748b',
  },
  createButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});