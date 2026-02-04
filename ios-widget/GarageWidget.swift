import WidgetKit
import SwiftUI

// Widget Provider
struct GarageWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> GarageWidgetEntry {
        GarageWidgetEntry(date: Date(), doorState: "Unknown")
    }

    func getSnapshot(in context: Context, completion: @escaping (GarageWidgetEntry) -> ()) {
        let entry = GarageWidgetEntry(date: Date(), doorState: "Closed")
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [GarageWidgetEntry] = []

        // Get current door state from shared UserDefaults
        let sharedDefaults = UserDefaults(suiteName: "group.com.garage.autoopener")
        let doorState = sharedDefaults?.string(forKey: "doorState") ?? "Unknown"

        let currentDate = Date()
        let entry = GarageWidgetEntry(date: currentDate, doorState: doorState)
        entries.append(entry)

        // Refresh every 5 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 5, to: currentDate)!
        let timeline = Timeline(entries: entries, policy: .after(nextUpdate))
        completion(timeline)
    }
}

// Widget Entry
struct GarageWidgetEntry: TimelineEntry {
    let date: Date
    let doorState: String
}

// Widget View
struct GarageWidgetEntryView : View {
    var entry: GarageWidgetProvider.Entry
    @Environment(\.widgetFamily) var widgetFamily

    var body: some View {
        switch widgetFamily {
        case .systemSmall:
            SmallWidgetView(doorState: entry.doorState)
        case .systemMedium:
            MediumWidgetView(doorState: entry.doorState)
        default:
            SmallWidgetView(doorState: entry.doorState)
        }
    }
}

// Small Widget View
struct SmallWidgetView: View {
    let doorState: String

    var body: some View {
        ZStack {
            LinearGradient(
                gradient: Gradient(colors: [Color.blue.opacity(0.8), Color.blue]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(spacing: 8) {
                Image(systemName: doorStateIcon)
                    .font(.system(size: 40))
                    .foregroundColor(.white)

                Text(doorState)
                    .font(.headline)
                    .foregroundColor(.white)

                Text("Tap to Open")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
            }
            .padding()
        }
        .widgetURL(URL(string: "garage://open")!)
    }

    var doorStateIcon: String {
        switch doorState.lowercased() {
        case "open":
            return "door.garage.open"
        case "closed":
            return "door.garage.closed"
        case "opening":
            return "arrow.up.square"
        case "closing":
            return "arrow.down.square"
        default:
            return "questionmark.square"
        }
    }
}

// Medium Widget View
struct MediumWidgetView: View {
    let doorState: String

    var body: some View {
        ZStack {
            LinearGradient(
                gradient: Gradient(colors: [Color.blue.opacity(0.8), Color.blue]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            HStack(spacing: 20) {
                // Left side - Status
                VStack(alignment: .leading, spacing: 8) {
                    Image(systemName: doorStateIcon)
                        .font(.system(size: 50))
                        .foregroundColor(.white)

                    Text(doorState)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)

                    Text("Garage Door")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                }
                .padding(.leading, 20)

                Spacer()

                // Right side - Action Buttons
                VStack(spacing: 12) {
                    Link(destination: URL(string: "garage://open")!) {
                        HStack {
                            Image(systemName: "arrow.up.circle.fill")
                            Text("Open")
                                .fontWeight(.semibold)
                        }
                        .foregroundColor(.blue)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color.white)
                        .cornerRadius(8)
                    }

                    Link(destination: URL(string: "garage://close")!) {
                        HStack {
                            Image(systemName: "arrow.down.circle.fill")
                            Text("Close")
                                .fontWeight(.semibold)
                        }
                        .foregroundColor(.blue)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(Color.white)
                        .cornerRadius(8)
                    }
                }
                .frame(width: 100)
                .padding(.trailing, 20)
            }
        }
    }

    var doorStateIcon: String {
        switch doorState.lowercased() {
        case "open":
            return "door.garage.open"
        case "closed":
            return "door.garage.closed"
        case "opening":
            return "arrow.up.square.fill"
        case "closing":
            return "arrow.down.square.fill"
        default:
            return "questionmark.square.dashed"
        }
    }
}

// Widget Configuration
@main
struct GarageWidget: Widget {
    let kind: String = "GarageWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: GarageWidgetProvider()) { entry in
            GarageWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Garage Control")
        .description("Quick access to your garage door")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// Widget Preview
struct GarageWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            GarageWidgetEntryView(entry: GarageWidgetEntry(date: Date(), doorState: "Closed"))
                .previewContext(WidgetPreviewContext(family: .systemSmall))

            GarageWidgetEntryView(entry: GarageWidgetEntry(date: Date(), doorState: "Open"))
                .previewContext(WidgetPreviewContext(family: .systemMedium))
        }
    }
}
