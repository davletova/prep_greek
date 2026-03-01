//
//  PhraseView.swift
//  Phraseo
//
//  Created by Алия Давлетова on 11.06.2025.
//
import Foundation
import SwiftUI

struct PhraseCard: View {
    let phrase: DisplayPhrase
    
    @State private var isSaved = false
    @State private var didCopy = false
    
    let onPlay: () -> Void
    let onSave: () -> Void
    let onDelete: () -> Void
    let onTag: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            TagChip(text: phrase.tag)
                .padding(.top, 4)
                .onTapGesture { /* show tag bottomSheet */ }
                .offset(y: -12)
            
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(phrase.text)
                        .font(.headline.weight(.semibold))
                        .foregroundStyle(Color.permanentMainText)
                        .contentShape(Rectangle())
                        .onTapGesture {
                            UIPasteboard.general.string = phrase.text
                            UINotificationFeedbackGenerator().notificationOccurred(.success)
                            withAnimation(.spring(response: 0.25, dampingFraction: 0.9)) {
                                didCopy = true
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
                                withAnimation(.easeOut(duration: 0.2)) {
                                    didCopy = false
                                }
                            }
                        }
                    Text(phrase.translation)
                        .font(.subheadline)
                        .foregroundColor(Color.cardSecondText)
                }
                Spacer(minLength: 12)
                HStack(spacing: 12) {
                    iconButton(
                        "play.circle",
                        tint: Color.permanentMainText,
                        action: onPlay
                    )
                    iconButton(
                        isSaved ? "star.fill" : "star",
                        tint: isSaved ? Color.phraseIsSavedIcon : Color.phraseIsUnsavedIcon,
                        action: saveOrDelete
                    )
                }
            }
        }
        .padding(16)
        .background(Color.cardBg)
        .cornerRadius(14)
        .shadow(color: .black.opacity(0.06), radius: 4, y: 1)
        .overlay(alignment: .topTrailing) { // маленький тост
            if didCopy {
                Text("Copied")
                    .font(.footnote.weight(.semibold))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(.ultraThinMaterial)
                    .clipShape(Capsule())
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .padding(8)
            }
        }
    }
    
    private func iconButton(
        _ name: String,
        tint: Color,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            Image(systemName: name)
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(tint)
        }
        .buttonStyle(PlainButtonStyle())
    }
    
    private func saveOrDelete() {
        if isSaved {
            onDelete()
            isSaved = false
        } else {
            onSave()
            isSaved = true
        }
    }
}

#Preview {
    PhraseCard(
        phrase: DisplayPhrase(
            text: "Doctor's appointment",
            translation: "Is there any upcoming homework?",
            tag: "Есть ли какая-то предстоящая домашняя работа?"
        ),
        
        onPlay: { },
        onSave: { },
        onDelete: { },
        onTag: { }
    )
    .padding(12)
}
