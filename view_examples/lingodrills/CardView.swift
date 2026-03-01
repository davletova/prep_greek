//
//  CardView.swift
//  Phraseo
//
//  Created by Алия Давлетова on 11.06.2025.
//

import Foundation
import SwiftUI

struct CardView: View {
    let title: String
    let subtitle: String?
    let action: () -> Void
    
    init(
        title: String,
        subtitle: String? = nil,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.subtitle = subtitle
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline.weight(.semibold))
                        .foregroundStyle(Color.permanentMainText)
                    if let subtitle {
                        Text(subtitle).font(.subheadline).foregroundColor(Color.cardSecondText)
                    }
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .foregroundColor(Color(hex: "#4A5C82"))
            }
            .padding(.horizontal, 20).padding(.vertical, 16)
            .frame(maxWidth: .infinity, minHeight: 88)
            .background(Color.cardBg)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.06), radius: 4, y: 1)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    CardView(title: "Тема/ситуация", subtitle: "Поход к доктору, встреча с другом и т.д.", action: { })
}
