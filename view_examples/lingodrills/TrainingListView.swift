//
//  TrainView.swift
//  Phraseo
//
//  Created by Алия Давлетова on 11.06.2025.
//

import Foundation
import SwiftUI

struct TrainingListView<ViewModel: TrainingListViewModelProtocol> {
    @State private var selection: ExerciseType?
    
    private let viewModel: ViewModel
    
    init(viewModel: ViewModel) {
        self.viewModel = viewModel
    }
}

extension TrainingListView: View {
    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 24) {
                Text("Train")
                    .font(.largeTitle.weight(.bold))
                    .foregroundStyle(Color.changeableMainText)
                
                ScrollView {
                    ForEach(ExerciseType.trainings, id: \.self) { type in
                        CardView(title: type.title, subtitle: type.description) { selection = type }
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 24)
            .navigationBarTitleDisplayMode(.inline)
            .navigationDestination(item: $selection) { selectedMode in
                switch selectedMode {
                case .savedPhrases:
                    TagsListView(
                        viewModel: TagsListViewModel(
                            languageSettings: viewModel.languageSettings,
                            phraseManager: viewModel.phraseManager
                        )
                    )
                    .toolbar(.hidden, for: .tabBar)
                case .grammarGap(_):
                    GrammarRulesListView(
                        viewModel: GrammarRulesListViewModel(
                            languageSettings: viewModel.languageSettings
                        )
                    )
                    .toolbar(.hidden, for: .tabBar)
                case .vocabularyGap(_):
                    VocabularyListView(
                        viewModel: VocabularyListViewModel(
                            languageSettings: viewModel.languageSettings
                        )
                    )
                    .toolbar(.hidden, for: .tabBar)
                case .wordTranslation(_):
                    TranslationListView(
                        // TODO: убрать LanguageSettingsService() внутрь вьюмодели во всех кейсах
                        viewModel: TranslationListViewModel(languageSettings: viewModel.languageSettings)
                    )
                    .toolbar(.hidden, for: .tabBar)
                case .reverseTranslation(_):
                    ReverseTranslationListView(
                        viewModel: ReverseTranslationListViewModel(languageSettings: viewModel.languageSettings)
                    )
                    .toolbar(.hidden, for: .tabBar)
                case .sentenceBuilder(_):
                    SentenceBuilderListView(
                        viewModel: SentenceBuilderListViewModel(languageSettings: viewModel.languageSettings)
                    )
                    .toolbar(.hidden, for: .tabBar)
                case .listening:
                    ListeningFlowView(
                        viewModel: ListeningFlowViewModel(quizType: .listening, languagesService: viewModel.languageSettings)
                    )
                    .toolbar(.hidden, for: .tabBar)
                }
            }
            .background(Color.mainBg)
        }
    }
}

private extension ExerciseType {
    static var trainings: [ExerciseType] {
        [.grammarGap(.mixed), .vocabularyGap(.mixed), .wordTranslation(.mixed), .reverseTranslation(.mixed), .sentenceBuilder(.mixed), .listening, .savedPhrases]
    }
    
    var title: String {
        switch self {
        case .grammarGap(_): "Grammar Gap Fill"
        case .vocabularyGap(_): "Vocabulary Gap Fill"
        case .wordTranslation(_): "Word Translation"
        case .savedPhrases: "Repeating phrases"
        case .reverseTranslation(_): "Reverse Word Translation"
        case .sentenceBuilder(_): "Sentence Builder (Grammar)"
        case .listening: "Listening Comprehension"
        }
    }
    
    var description: String {
        switch self {
        case .grammarGap(_): "Choose the correct form to complete"
        case .vocabularyGap(_): "Choose the best word for context"
        case .wordTranslation(_): "Choose the correct translation using context"
        case .savedPhrases: "Review and recall your saved phrases"
        case .reverseTranslation(_): "Type the translation using the context"
        case .sentenceBuilder(_): "Build a correct sentence from cues"
        case .listening: "Listen to the sentence and answer the question"
        }
    }
}
