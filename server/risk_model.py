import pandas as pd
from sklearn.cluster import KMeans
from openpyxl import load_workbook
from openpyxl.styles import PatternFill

def process_student_data(attendence_file, marks_file, fee_file, output_file="student_risk.xlsx"):
    attendence_df = pd.read_csv(attendence_file)
    marks_df = pd.read_csv(marks_file)
    fee_df = pd.read_csv(fee_file)

    attendence_df.rename(columns={"student rollno.": "student_ID"}, inplace=True)
    fee_df.rename(columns={"student rollno.": "student_ID"}, inplace=True)

    df = attendence_df.merge(marks_df, left_on="student_ID", right_index=True, how="inner")
    df = df.merge(fee_df, on="student_ID", how="inner")

    df = df[["student_ID", "attendence percentage", "marks_percentage", "fee_reamining"]]

    kmeans = KMeans(n_clusters=3, random_state=42)
    df["fee_cluster"] = kmeans.fit_predict(df[["fee_reamining"]])

    cluster_order = df.groupby("fee_cluster")["fee_reamining"].mean().sort_values().index
    cluster_mapping = {
        cluster_order[0]: "Green",
        cluster_order[1]: "Orange",
        cluster_order[2]: "Red"
    }
    df["fee_risk"] = df["fee_cluster"].map(cluster_mapping)

    def attendence_risk(x):
        if x < 50:
            return "Red"
        elif x < 75:
            return "Orange"
        return "Green"

    def marks_risk(x):
        if x < 40:
            return "Red"
        elif x < 75:
            return "Orange"
        return "Green"

    df["Attendance_risk"] = df["attendence percentage"].apply(attendence_risk)
    df["Marks_risk"] = df["marks_percentage"].apply(marks_risk)

    df.to_excel(output_file, index=False)
    wb = load_workbook(output_file)
    ws = wb.active
    color_map = {"Red": "FF9999", "Orange": "FFD580", "Green": "99FF99"}
    for col_name in ["fee_risk", "Attendance_risk", "Marks_risk"]:
        col_idx = [cell.value for cell in ws[1]].index(col_name) + 1
        for row in range(2, ws.max_row + 1):
            cell = ws.cell(row=row, column=col_idx)
            if cell.value in color_map:
                cell.fill = PatternFill(
                    start_color=color_map[cell.value],
                    end_color=color_map[cell.value],
                    fill_type="solid"
                )
    wb.save(output_file)
    return df

def simulate_future_risk(student_row, new_attendance=None, new_marks=None):
    att = new_attendance if new_attendance is not None else student_row["attendence percentage"]
    marks = new_marks if new_marks is not None else student_row["marks_percentage"]
    fee = student_row["fee_reamining"]
    dropout_prob = 0.4 * (100 - att) / 100 + 0.4 * (100 - marks) / 100 + 0.2 * (fee > 0)
    dropout_prob = round(dropout_prob * 100, 2)
    return f"If current trend continues, probability of dropout = {dropout_prob}%"

def query_students(df, query: str):
    query = query.lower()
    if "top" in query and "red" in query:
        result = df[(df["Attendance_risk"]=="Red") | 
                    (df["Marks_risk"]=="Red") | 
                    (df["fee_risk"]=="Red")].head(5)
        return result[["student_ID", "Attendance_risk", "Marks_risk", "fee_risk"]]
    elif "orange" in query:
        result = df[(df["Attendance_risk"]=="Orange") | 
                    (df["Marks_risk"]=="Orange") | 
                    (df["fee_risk"]=="Orange")].head(5)
        return result[["student_ID", "Attendance_risk", "Marks_risk", "fee_risk"]]
    else:
        return "Query not understood"

def interactive_simulator(df):
    student_id = input("Enter student ID: ").strip()
    if student_id not in df["student_ID"].astype(str).values:
        print("Student ID not found.")
        return
    student_row = df[df["student_ID"].astype(str) == student_id].iloc[0]
    print(f"\nCurrent values for {student_id}:")
    print(f"Attendance: {student_row['attendence percentage']}%")
    print(f"Marks: {student_row['marks_percentage']}%")
    print(f"Fee Remaining: {student_row['fee_reamining']}")
    try:
        new_att = input("Enter new Attendance % (or press Enter to keep current): ")
        new_marks = input("Enter new Marks % (or press Enter to keep current): ")
        new_att = float(new_att) if new_att else student_row['attendence percentage']
        new_marks = float(new_marks) if new_marks else student_row['marks_percentage']
        att_risk = "Red" if new_att < 50 else "Orange" if new_att < 75 else "Green"
        marks_risk = "Red" if new_marks < 40 else "Orange" if new_marks < 75 else "Green"
        fee_risk = student_row["fee_risk"]
        print("\nSimulated Risk Levels")
        print(f"Attendance Risk: {att_risk}")
        print(f"Marks Risk: {marks_risk}")
        print(f"Fee Risk: {fee_risk}")
        print(simulate_future_risk(student_row, new_attendance=new_att, new_marks=new_marks))
    except ValueError:
        print("Invalid input")

df_result = process_student_data("attendence.csv", "marks.csv", "fee.csv")
print(simulate_future_risk(df_result.iloc[0], new_attendance=70))
interactive_simulator(df_result)

def mentor_bot(df):
    print("Mentor Chat Bot. Type 'exit' to quit.\n")
    while True:
        query = input("You: ").strip()
        if query.lower() == "exit":
            print("Bot: Bye!")
            break
        query_lower = query.lower()
        if "red" in query_lower:
            result = df[(df["Attendance_risk"]=="Red") | 
                        (df["Marks_risk"]=="Red") | 
                        (df["fee_risk"]=="Red")].head(5)
        elif "orange" in query_lower:
            result = df[(df["Attendance_risk"]=="Orange") | 
                        (df["Marks_risk"]=="Orange") | 
                        (df["fee_risk"]=="Orange")].head(5)
        else:
            print("Bot: Query not understood")
            continue
        if result.empty:
            print("Bot: No students found.")
        else:
            for _, row in result.iterrows():
                print(f"Student ID: {row['student_ID']}, "
                      f"Attendance Risk: {row['Attendance_risk']}, "
                      f"Marks Risk: {row['Marks_risk']}, "
                      f"Fee Risk: {row['fee_risk']}")
            print("\n")

mentor_bot(df_result)
