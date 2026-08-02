import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { X, Plus, Check, Trash2, Tag, Palette } from "lucide-react-native";
import { colors, fonts } from "../theme/colors";
import type { Category } from "../types";

type Props = {
  visible: boolean;
  categories: Category[];
  onClose: () => void;
  onSaveCategory: (category: Category) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
};

const COLOR_PALETTE = [
  "#C0603B", // Rust
  "#4FA184", // Jade
  "#D7B56D", // Brass
  "#8B7EC8", // Purple
  "#E05A47", // Coral
  "#3B82F6", // Blue
  "#EC4899", // Pink
  "#F59E0B", // Amber
  "#10B981", // Emerald
  "#6366F1", // Indigo
];

export default function CategoriesModal({
  visible,
  categories,
  onClose,
  onSaveCategory,
  onDeleteCategory,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setName("");
    setColor(COLOR_PALETTE[0]);
    setEditingId(null);
  }

  function handleEdit(cat: Category) {
    setEditingId(cat.id);
    setName(cat.name);
    setColor(cat.color);
  }

  async function handleSave() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSaveCategory({
        id: editingId || "",
        name: name.trim(),
        color,
      });
      resetForm();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setLoading(true);
    try {
      await onDeleteCategory(id);
      if (editingId === id) resetForm();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Tag size={20} color={colors.brass} />
              <Text style={styles.title}>Gerenciar Categorias</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} hitSlop={8}>
              <X size={20} color={colors.paperDim} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} contentContainerStyle={{ gap: 16 }}>
            {/* Form */}
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>
                {editingId ? "Editar Categoria" : "Nova Categoria"}
              </Text>
              <View style={styles.field}>
                <Text style={styles.label}>Nome do Rótulo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Mercado, Aluguel, Pet..."
                  placeholderTextColor={colors.paperDim}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.field}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Palette size={14} color={colors.paperDim} />
                  <Text style={styles.label}>Cor da Categoria</Text>
                </View>
                <View style={styles.paletteRow}>
                  {COLOR_PALETTE.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: c },
                        color === c && styles.colorCircleSelected,
                      ]}
                      onPress={() => setColor(c)}
                    >
                      {color === c && <Check size={14} color="#FFF" />}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.saveBtn, loading && { opacity: 0.6 }]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.ink} />
                  ) : (
                    <>
                      {editingId ? <Check size={16} color={colors.ink} /> : <Plus size={16} color={colors.ink} />}
                      <Text style={styles.saveBtnText}>{editingId ? "Salvar" : "Adicionar"}</Text>
                    </>
                  )}
                </TouchableOpacity>
                {editingId && (
                  <TouchableOpacity style={styles.cancelBtn} onPress={resetForm} disabled={loading}>
                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* List */}
            <Text style={styles.sectionTitle}>Suas Categorias ({categories.length})</Text>
            {categories.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma categoria cadastrada ainda.</Text>
            ) : (
              categories.map((cat) => (
                <View key={cat.id} style={styles.categoryRow}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </View>

                  <View style={styles.rowActions}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleEdit(cat)}>
                      <Tag size={14} color={cat.color} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(cat.id)}>
                      <Trash2 size={14} color={colors.rust} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: colors.ink,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "85%",
    padding: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.line,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.paper,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    flexGrow: 0,
  },
  formCard: {
    backgroundColor: colors.panel,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    gap: 12,
  },
  formTitle: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 13,
    color: colors.paper,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: colors.paperDim,
  },
  input: {
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.paper,
    fontFamily: fonts.mono,
    fontSize: 13,
  },
  paletteRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  colorCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  colorCircleSelected: {
    borderWidth: 2,
    borderColor: "#FFF",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  saveBtn: {
    backgroundColor: colors.brass,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  saveBtnText: {
    color: colors.ink,
    fontWeight: "600",
    fontSize: 13,
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelBtnText: {
    color: colors.paperDim,
    fontSize: 13,
  },
  sectionTitle: {
    fontFamily: fonts.monoSemiBold,
    fontSize: 12,
    color: colors.paperDim,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  emptyText: {
    color: colors.paperDim,
    fontSize: 13,
    fontStyle: "italic",
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryName: {
    fontSize: 14,
    color: colors.paper,
    fontWeight: "500",
  },
  rowActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBtn: {
    padding: 4,
  },
});
